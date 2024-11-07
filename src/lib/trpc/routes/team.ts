import type { Invitation } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';
import { sendEmail } from '../email';
import { inviteToTeamToken } from '$lib/lucia';

export const teamRouter = t.router({
	getTeam: t.procedure.use(authenticate(['HACKER'])).query(async (req) => {
		const teamId = (await prisma.user.findUnique({ where: { authUserId: req.ctx.user.id } }))
			?.teamId;
		if (!teamId) return null;
		const team = await prisma.team.findUnique({
			where: { id: teamId },
			include: {
				members: {
					select: {
						authUser: {
							select: { email: true },
						},
					},
				},
			},
		});
		return team;
	}),

	createTeam: t.procedure
		.use(authenticate(['HACKER']))
		.input(z.string().trim())
		.mutation(async (req) => {
			const userId = req.ctx.user.id;
			const existingUser = await prisma.user.findUniqueOrThrow({
				where: { authUserId: userId },
			});

			if (existingUser.teamId) {
				throw new Error('User is already on a team');
			}

			const newTeam = await prisma.team.create({
				data: {
					name: req.input,
					members: { connect: { authUserId: userId } },
				},
			});

			await prisma.user.update({
				where: { authUserId: userId },
				data: { teamId: newTeam.id },
			});
		}),

	leaveTeam: t.procedure.use(authenticate(['HACKER'])).mutation(async (req): Promise<void> => {
		const userId = req.ctx.user.id;
		const teamData = await prisma.user.findUnique({
			where: { authUserId: userId },
			select: {
				team: { select: { id: true, members: true } },
			},
		});

		if (!teamData?.team) {
			throw new Error('User is not on a team');
		}

		const { id: teamId, members } = teamData.team;

		await prisma.user.update({
			where: { authUserId: userId },
			data: { teamId: null },
		});

		// If the user was the only member, delete the team
		if (members.length === 1) {
			await prisma.team.delete({ where: { id: teamId } });
		}
	}),

	getTeamInvitations: t.procedure
		.use(authenticate(['HACKER']))
		.query(async ({ ctx }): Promise<Invitation[]> => {
			const { teamId } =
				(await prisma.user.findUnique({
					where: { authUserId: ctx.user.id },
					select: { teamId: true },
				})) ?? {};

			if (!teamId) return [];

			return await prisma.invitation.findMany({
				where: { teamId },
			});
		}),

	inviteUser: t.procedure
		.input(z.string().email())
		.use(authenticate(['HACKER']))
		.mutation(async ({ ctx, input }): Promise<string> => {
			const callerId = ctx.user.id;
			const email = input.toLowerCase().trim();

			const { teamId } =
				(await prisma.user.findUnique({
					where: { authUserId: callerId },
					select: { teamId: true },
				})) ?? {};

			if (!teamId) return 'You must be on a team to invite others.';
			if ((await getTeamSize(teamId)) >= 4)
				return 'Your team already has the maximum allowed size. You cannot invite more users.';

			const invitedUser = await prisma.authUser.findUnique({
				where: { email },
			});

			if (!invitedUser) return 'The provided email is not associated with any account.';
			if (callerId === invitedUser.id) return 'You cannot invite yourself.';
			if (!invitedUser.roles.includes('HACKER')) return 'The user is not a hacker.';

			await prisma.invitation.deleteMany({ where: { email, teamId } });

			await prisma.invitation.create({
				data: {
					email: invitedUser.email,
					teamId,
					userId: invitedUser.id,
				},
			});

			const token = await inviteToTeamToken.issue(invitedUser.id);
			const inviteLink = `${process.env.DOMAIN_NAME}/account/respond-invitation?token=${token}&teamId=${teamId}`;
			const emailBody = `
				You have been invited to join a team. 
				Please note that this link will expire in one week.
				Click the following link to accept the invitation:
				<a href="${inviteLink}">Join Team</a>
			`;

			return (await sendEmail(email, 'You have been invited to a team', emailBody, true))
				? 'Invited user!'
				: 'Failed to send invitation email. Please try again later.';
		}),

	acceptInvitation: t.procedure
		.use(authenticate(['HACKER']))
		.input(
			z.object({
				token: z.string(),
				teamId: z.number(),
			})
		)
		.mutation(async ({ input }): Promise<string> => {
			const userId = await inviteToTeamToken.validate(input.token);
			if (!userId) return 'Invalid or expired token. Please request a new invitation.';

			if ((await getTeamSize(input.teamId)) >= 4) return 'Team is full';

			const invitation = await prisma.invitation.findFirst({
				where: {
					userId,
					teamId: input.teamId,
					status: 'PENDING',
				},
			});

			if (!invitation) return 'No valid invitation found for the specified team';

			const userStatus = await prisma.authUser.findUnique({
				where: { id: userId },
				select: {
					status: true,
					user: { select: { teamId: true } },
				},
			});

			if (
				!userStatus ||
				!['CREATED', 'APPLIED', 'ACCEPTED', 'CONFIRMED'].includes(userStatus.status) ||
				userStatus.user?.teamId !== null
			) {
				return 'User is not eligible to join a team';
			}

			await prisma.$transaction([
				prisma.user.update({
					where: { authUserId: userId },
					data: { teamId: input.teamId },
				}),
				prisma.invitation.update({
					where: { id: invitation.id },
					data: { status: 'ACCEPTED' },
				}),
			]);

			return 'User has been added to the team';
		}),

	rejectInvitation: t.procedure
		.use(authenticate(['HACKER']))
		.input(
			z.object({
				token: z.string(),
				teamId: z.number(),
			})
		)
		.mutation(async ({ input }): Promise<string> => {
			const userId = await inviteToTeamToken.validate(input.token);
			if (!userId) return 'Invalid or expired token';

			const invitation = await prisma.invitation.findFirst({
				where: {
					userId,
					teamId: input.teamId,
					status: 'PENDING',
				},
			});

			if (!invitation) return 'No valid invitation found for the specified team';

			await prisma.invitation.update({
				where: { id: invitation.id },
				data: { status: 'REJECTED' },
			});

			return 'Invitation has been rejected';
		}),

	getTeammates: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.string())
		.query(async ({ input }) => {
			const team = await prisma.team.findUnique({
				where: { id: parseInt(input, 10) },
				include: { members: true },
			});

			if (!team || team.members.length === 0) return [];

			const teammates = await prisma.user.findMany({
				where: { teamId: team.id },
				select: {
					authUser: { select: { email: true, status: true } },
					decision: { select: { status: true } },
				},
			});

			return teammates.map(({ authUser, decision }) => ({
				email: authUser.email,
				status: decision?.status || authUser.status,
			}));
		}),
});

/*
// Removes team members who have been rejected or declined the hackathon
async function removeTeamMembers(teamId: number): Promise<void> {
	const team = await prisma.team.findUnique({
		where: { id: teamId },
		include: {
			members: {
				select: {
					authUserId: true,
					authUser: { select: { status: true } },
				},
			},
		},
	});

	if (!team) return;

	// Filter for members with 'REJECTED' or 'DECLINED' status
	const usersToRemove = team.members
		.filter(({ authUser }) => authUser?.status === 'REJECTED' || authUser?.status === 'DECLINED')
		.map(({ authUserId }) => authUserId);

	if (usersToRemove.length === 0) return;

	const remainingMembers = team.members.length - usersToRemove.length;

	await prisma.$transaction(async (prisma) => {
		if (remainingMembers === 0) {
			await prisma.team.delete({ where: { id: teamId } });
		} 

		await prisma.user.updateMany({
			where: { authUserId: { in: usersToRemove } },
			data: { teamId: null },
		});
	});
}
*/

async function getTeamSize(teamId: number): Promise<number> {
	const team = await prisma.team.findUnique({
		where: { id: teamId },
		select: { members: true },
	});

	if (!team) {
		return 0;
	}

	return team.members.length;
}
