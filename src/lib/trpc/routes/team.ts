import type { Team, User, Invitation } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';
import { sendEmails } from '../email';
import { inviteToTeamToken } from '$lib/lucia';

type TeamWithMembers = {
	id: number;
	name: string;
	createdAt: Date;
	tracks: string[];
	devpostUrl: string | null;
	members: {
		name: string;
		email: string;
	}[];
};

export const teamRouter = t.router({
	// Get the team of the authenticated user, if no team is found, return null
	getUserTeam: t.procedure
		.use(authenticate(['HACKER']))
		.query(async (req): Promise<TeamWithMembers | null> => {
			const team = await getTeam(req.ctx.user.id);
			if (!team) return null;

			const memberIds = team.members.map((member) => member.authUserId);

			const emails = await prisma.authUser.findMany({
				where: { id: { in: memberIds } },
				select: { id: true, email: true },
			});

			const names = await prisma.user.findMany({
				where: { authUserId: { in: memberIds } },
				select: { authUserId: true, name: true },
			});

			const members = team.members.map((member) => {
				const email = emails.find((user) => user.id === member.authUserId)?.email;
				if (!email) throw new Error(`Email not found for authUserId: ${member.authUserId}`);

				const name = names.find((user) => user.authUserId === member.authUserId)?.name || 'Hacker';
				return { name, email };
			});

			return {
				id: team.id,
				name: team.name,
				createdAt: team.createdAt,
				tracks: team.tracks,
				devpostUrl: team.devpostUrl,
				members,
			};
		}),

	// Create a new team with the authenticated user as the only member
	createTeam: t.procedure
		.use(authenticate(['HACKER']))
		.input(z.string())
		.mutation(async (req): Promise<void> => {
			const user = req.ctx.user;
			const userId = user?.id;

			if (!userId) throw new Error('User not found');

			const existingUser = await prisma.user.findUniqueOrThrow({
				where: { authUserId: userId },
			});

			if (existingUser.teamId) throw new Error('User is already on a team');

			const newTeam = await prisma.team.create({
				data: {
					name: req.input, // Team name
					members: { connect: { authUserId: userId } },
				},
			});

			await prisma.user.update({
				where: { authUserId: userId },
				data: { teamId: newTeam.id },
			});
		}),

	// Leave the team of the authenticated user
	leaveTeam: t.procedure.use(authenticate(['HACKER'])).mutation(async (req): Promise<void> => {
		const userId = req.ctx.user.id;

		const user = await prisma.user.findUniqueOrThrow({
			where: { authUserId: userId },
			select: { teamId: true },
		});

		if (!user.teamId) throw new Error('User is not on a team');

		const team = await prisma.team.findUniqueOrThrow({
			where: { id: user.teamId },
			include: { members: true },
		});

		if (team.members.length === 1) {
			await prisma.invitation.deleteMany({ where: { teamId: team.id } });
			await prisma.team.delete({ where: { id: team.id } });
		} else {
			await prisma.team.update({
				where: { id: team.id },
				data: { members: { disconnect: { authUserId: userId } } },
			});
		}

		await prisma.user.update({
			where: { authUserId: userId },
			data: { teamId: null },
		});
	}),

	// Update the devpost URL of the team of the authenticated user, false if the URL is invalid
	uploadDevpost: t.procedure
		.input(z.string())
		.use(authenticate(['HACKER']))
		.mutation(async ({ ctx, input }): Promise<boolean> => {
			const userId = ctx.user.id;

			const devpostRegex = /^https:\/\/devpost\.com\/software\/[a-zA-Z0-9_-]+$/;
			if (!devpostRegex.test(input)) {
				return false;
			}

			const user = await prisma.user.findUniqueOrThrow({
				where: { authUserId: userId },
				select: { teamId: true },
			});

			if (!user.teamId) {
				throw new Error('User is not on a team');
			}

			await prisma.team.update({
				where: { id: user.teamId },
				data: { devpostUrl: input },
			});

			return true;
		}),

	getTeamInvitations: t.procedure
		.use(authenticate(['HACKER']))
		.query(async ({ ctx }): Promise<Invitation[]> => {
			const userId = ctx.user.id;

			const user = await prisma.user.findUniqueOrThrow({
				where: { authUserId: userId },
				select: { teamId: true },
			});

			if (!user.teamId) {
				return [];
			}

			return prisma.invitation.findMany({
				where: { teamId: user.teamId },
			});
		}),

	inviteUser: t.procedure
		.input(z.string().email())
		.use(authenticate(['HACKER']))
		.mutation(async ({ ctx, input }): Promise<void> => {
			const callerId = ctx.user.id;
			const email = input.toLowerCase().trim(); // Sanitize email input

			// Ensure caller is on a team
			const { teamId } = await prisma.user.findUniqueOrThrow({
				where: { authUserId: callerId },
				select: { teamId: true },
			});

			if (!teamId) throw new Error('You must be on a team to invite others.');

			// Ensure the invited user exists and is not the same as the caller
			const invitedUser = await prisma.authUser.findUniqueOrThrow({
				where: { email },
			});

			if (callerId === invitedUser.id) throw new Error('You cannot invite yourself.');

			// Overwrite any existing invitations for the same email and team
			await prisma.invitation.deleteMany({ where: { email, teamId } });

			await prisma.invitation.create({
				data: {
					email: invitedUser.email,
					teamId,
					userId: invitedUser.id,
					status: 'PENDING',
				},
			});

			// Generate invitation link with token and send email
			const token = await inviteToTeamToken.issue(invitedUser.id);
			const inviteLink = `${process.env.DOMAIN_NAME}/account?token=${token}&teamId=${teamId}`;
			const emailBody = `
			You have been invited to join a team.
			Click the following link to accept the invitation: 
			<a href="${inviteLink}">Join Team</a>
		  `;

			await sendEmails([email], 'You have been invited to a team', emailBody, true);
		}),

	acceptInvitation: t.procedure
		.input(
			z.object({
				token: z.string(),
				teamId: z.number(),
			})
		)
		.mutation(async ({ input }): Promise<void> => {
			const { token, teamId } = input;
			const userId = await inviteToTeamToken.validate(token);
			if (!userId) {
				throw new Error('Invalid or expired token');
			}

			// Find the pending invitation
			const invitation = await prisma.invitation.findFirst({
				where: {
					userId,
					teamId,
					status: 'PENDING',
				},
			});
			if (!invitation) {
				throw new Error('No valid invitation found for the specified team');
			}

			// Add the user to the team and accept the invitation in a single transaction
			await prisma.$transaction([
				prisma.team.update({
					where: { id: teamId },
					data: {
						members: {
							connect: { authUserId: userId },
						},
					},
				}),
				prisma.user.update({
					where: { authUserId: userId },
					data: { teamId },
				}),
				prisma.invitation.update({
					where: { id: invitation.id },
					data: { status: 'ACCEPTED' },
				}),
			]);
		}),

	rejectInvitation: t.procedure
		.input(
			z.object({
				token: z.string(),
				teamId: z.number(),
			})
		)
		.mutation(async ({ input }): Promise<void> => {
			const { token, teamId } = input;

			// Validate the token and fetch userId
			const userId = await inviteToTeamToken.validate(token);
			if (!userId) {
				throw new Error('Invalid or expired token');
			}

			// Find the pending invitation using userId and teamId
			const invitation = await prisma.invitation.findFirst({
				where: {
					userId,
					teamId,
					status: 'PENDING',
				},
			});

			if (!invitation) {
				throw new Error('No valid invitation found for the specified team.');
			}

			// Mark the invitation as rejected
			await prisma.invitation.update({
				where: { id: invitation.id },
				data: { status: 'REJECTED' },
			});
		}),
});

// Helper function to get the team of a user
async function getTeam(userId: string): Promise<(Team & { members: User[] }) | null> {
	const user = await prisma.user.findUnique({
		where: { authUserId: userId },
		select: { teamId: true },
	});

	// If user or teamId is not found, return null
	if (!user?.teamId) {
		return null;
	}

	// Include the team members in the response
	return await prisma.team.findUnique({
		where: { id: user.teamId },
		include: { members: true },
	});
}
