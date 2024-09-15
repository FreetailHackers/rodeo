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

export type TeamWithAdmissionStatus = {
	email: string;
	status: string;
};

export const teamRouter = t.router({
	// Get the team of the authenticated user, if no team is found, return null
	getUserTeam: t.procedure
		.use(authenticate(['HACKER']))
		.query(async (req): Promise<TeamWithMembers | null> => {
			const team = await getTeam(req.ctx.user.id);
			if (!team) return null;

			const members = await prisma.user.findMany({
				where: { teamId: team.id },
				select: {
					authUserId: true,
					name: true,
					authUser: { select: { email: true } },
				},
			});

			return {
				id: team.id,
				name: team.name,
				createdAt: team.createdAt,
				tracks: team.tracks,
				devpostUrl: team.devpostUrl,
				members: members.map((member) => ({
					name: member.name || 'Hacker',
					email: member.authUser.email,
				})),
			};
		}),

	// Create a new team with the authenticated user as the only member
	createTeam: t.procedure
		.use(authenticate(['HACKER']))
		.input(
			z
				.string()
				.trim()
				.min(1)
				.max(50)
				.refine((name) => name.trim().length > 0, {
					message: 'Team name cannot be empty or just whitespace',
				})
		)
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

			const devpostRegex = /^https:\/\/(www\.)?devpost\.com\/software\/[a-zA-Z0-9_-]+$/;
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
			const email = input.toLowerCase().trim();

			const { teamId } = await prisma.user.findUniqueOrThrow({
				where: { authUserId: callerId },
				select: { teamId: true },
			});

			if (!teamId) throw new Error('You must be on a team to invite others.');

			const invitedUser = await prisma.authUser.findUniqueOrThrow({
				where: { email },
			});

			if (callerId === invitedUser.id) throw new Error('You cannot invite yourself.');

			await prisma.invitation.deleteMany({ where: { email, teamId } });

			await prisma.invitation.create({
				data: {
					email: invitedUser.email,
					teamId,
					userId: invitedUser.id,
					status: 'PENDING',
				},
			});

			const token = await inviteToTeamToken.issue(invitedUser.id);
			const inviteLink = `${process.env.DOMAIN_NAME}/account?token=${token}&teamId=${teamId}`;
			const emailBody = `
				You have been invited to join a team.
				Click the following link to accept the invitation: 
				<a href="${inviteLink}">Join Team</a>
			`;

			try {
				await sendEmails([email], 'You have been invited to a team', emailBody, true);
			} catch (error) {
				console.error('Error inviting user:', error);
				throw new Error('Failed to send invitation email. Please try again.');
			}
		}),

	acceptInvitation: t.procedure
		.use(authenticate(['HACKER']))
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

			await prisma.$transaction(async (prisma) => {
				const teamSize = await getTeamSize(teamId);
				if (teamSize >= 4) {
					throw new Error('Team is full');
				}

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

				// User status must be 'CREATED', 'APPLIED', 'ACCEPTED', or 'CONFIRMED'
				const user = await prisma.authUser.findUnique({
					where: { id: userId },
					select: { status: true },
				});

				if (!user || !['CREATED', 'APPLIED', 'ACCEPTED', 'CONFIRMED'].includes(user?.status)) {
					throw new Error('User is not eligible to join a team');
				}

				await prisma.team.update({
					where: { id: teamId },
					data: {
						members: {
							connect: { authUserId: userId },
						},
					},
				});

				await prisma.user.update({
					where: { authUserId: userId },
					data: { teamId },
				});

				await prisma.invitation.update({
					where: { id: invitation.id },
					data: { status: 'ACCEPTED' },
				});
			});
		}),

	rejectInvitation: t.procedure
		.use(authenticate(['HACKER']))
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

			await prisma.invitation.update({
				where: { id: invitation.id },
				data: { status: 'REJECTED' },
			});
		}),

	getTeamSize: t.procedure.use(authenticate(['HACKER'])).query(async ({ ctx }): Promise<number> => {
		const user = await prisma.user.findUniqueOrThrow({
			where: { authUserId: ctx.user.id },
			select: { teamId: true },
		});

		if (!user.teamId) {
			return 0;
		}

		return getTeamSize(user.teamId);
	}),

	// Get teammates and admission status for the authenticated user
	getTeammatesAndAdmissionStatus: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.string())
		.query(async (req): Promise<TeamWithAdmissionStatus[]> => {
			const userId = req.input;
			if (!userId) {
				throw new Error('Valid user ID is required');
			}

			const team = await getTeam(userId.toString());
			if (!team) {
				return [];
			}

			const memberIds = team.members.map((member) => member.authUserId);
			if (memberIds.length === 0) {
				return [];
			}

			try {
				return await prisma.authUser.findMany({
					where: { id: { in: memberIds } },
					select: {
						email: true,
						status: true,
					},
				});
			} catch (error) {
				console.error('Error fetching teammates and admission statuses:', error);
				throw new Error(
					'Unable to fetch teammates and their admission statuses. Please try again.'
				);
			}
		}),
});

// Helper function to get the team of a user
async function getTeam(userId: string): Promise<(Team & { members: User[] }) | null> {
	const user = await prisma.user.findUnique({
		where: { authUserId: userId },
		select: { teamId: true },
	});

	if (!user?.teamId) {
		return null;
	}

	await removeTeammembers(user.teamId);

	return await prisma.team.findUnique({
		where: { id: user.teamId },
		include: { members: true },
	});
}

// Removes team members who have been rejected or declined the hackathon
async function removeTeammembers(teamId: number): Promise<void> {
	await prisma.$transaction(async (prisma) => {
		const team = await prisma.team.findUnique({
			where: { id: teamId },
			include: { members: true },
		});

		if (!team) return;

		const memberIds = team.members.map((member) => member.authUserId);

		const users = await prisma.authUser.findMany({
			where: { id: { in: memberIds } },
			select: { id: true, status: true },
		});

		const usersToRemove = users.filter(
			(user) => user.status === 'REJECTED' || user.status === 'DECLINED'
		);

		if (usersToRemove.length === 0) return;

		await prisma.team.update({
			where: { id: teamId },
			data: {
				members: {
					disconnect: usersToRemove.map((user) => ({ authUserId: user.id })),
				},
			},
		});

		await prisma.user.updateMany({
			where: {
				authUserId: { in: usersToRemove.map((user) => user.id) },
			},
			data: { teamId: null },
		});
	});
}

// Get the size of the team, ensuring that rejected or declined members are removed first
async function getTeamSize(teamId: number): Promise<number> {
	await removeTeammembers(teamId);

	const team = await prisma.team.findUnique({
		where: { id: teamId },
		select: { members: true },
	});

	if (!team) {
		return 0;
	}

	return team.members.length;
}
