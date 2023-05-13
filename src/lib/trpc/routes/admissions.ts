import type { Decision, Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';

async function releaseDecision(decision: Decision): Promise<void> {
	const hacker = await prisma.authUser.findUniqueOrThrow({
		where: { id: decision.userId },
	});
	if (hacker.status === 'APPLIED' || hacker.status === 'WAITLISTED') {
		const updateStatus = prisma.authUser.update({
			where: { id: decision.userId },
			data: { status: decision.status },
		});
		const deleteDecision = prisma.decision.delete({
			where: { userId: decision.userId },
		});
		await prisma.$transaction([updateStatus, deleteDecision]);

		let template = '';
		if (decision.status === 'ACCEPTED') {
			template = (await getSettings()).acceptTemplate;
		} else if (decision.status === 'REJECTED') {
			template = (await getSettings()).rejectTemplate;
		} else if (decision.status === 'WAITLISTED') {
			template = (await getSettings()).waitlistTemplate;
		}
		await sendEmail(hacker.email, 'Freetail Hackers status update', template, null);
	} else {
		await prisma.decision.delete({
			where: { userId: decision.userId },
		});
	}
}

export const admissionsRouter = t.router({
	/**
	 * Bulk accepts, rejects, or waitlists a list of IDs of users with
	 * submitted applications. User must be an admin.
	 */
	decide: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
				ids: z.array(z.string()),
			})
		)
		.mutation(async (req): Promise<void> => {
			for (const id of req.input.ids) {
				const user = await prisma.authUser.findUniqueOrThrow({
					where: {
						id: id,
					},
				});
				if (user.status === 'APPLIED' || user.status === 'WAITLISTED') {
					await prisma.decision.upsert({
						where: { userId: id },
						create: { userId: id, status: req.input.decision },
						update: { status: req.input.decision },
					});
				}
			}
		}),

	/**
	 * Gets all decisions. User must be an admin.
	 */
	getDecisions: t.procedure.use(authenticate(['ADMIN'])).query(
		async (): Promise<{
			accepted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			rejected: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			waitlisted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
		}> => {
			return {
				accepted: await prisma.decision.findMany({
					where: { status: 'ACCEPTED' },
					include: { user: true },
				}),
				rejected: await prisma.decision.findMany({
					where: { status: 'REJECTED' },
					include: { user: true },
				}),
				waitlisted: await prisma.decision.findMany({
					where: { status: 'WAITLISTED' },
					include: { user: true },
				}),
			};
		}
	),

	/**
	 * Releases all decisions. User must be an admin. This will empty
	 * the decisions table, apply all pending decisions to the users
	 * table, and send out email notifications.
	 */
	releaseAllDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.mutation(async (): Promise<void> => {
			const decisions = await prisma.decision.findMany();
			decisions.forEach((decision) => releaseDecision(decision));
		}),

	/**
	 * Bulk releases a list of pending decisions by user ID. User must
	 * be an admin. This will send out email notifications.
	 */
	releaseDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async (req): Promise<void> => {
			const decisions = await prisma.decision.findMany({
				where: { userId: { in: req.input } },
			});
			decisions.forEach((decision) => releaseDecision(decision));
		}),

	/**
	 * Bulk removes a list of pending decisions by user ID. User must be
	 * an admin.
	 */
	removeDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async (req): Promise<void> => {
			await prisma.decision.deleteMany({
				where: {
					userId: { in: req.input },
				},
			});
		}),

	/**
	 * Gets one user that has submitted their application. User must be
	 * an admin.
	 */
	getAppliedUser: t.procedure.use(authenticate(['ADMIN'])).query(
		async (): Promise<Prisma.UserGetPayload<{
			include: { authUser: true; decision: true };
		}> | null> => {
			return await prisma.user.findFirst({
				where: {
					authUser: {
						status: { in: ['APPLIED', 'WAITLISTED'] },
					},
					decision: null,
				},
				include: { authUser: true, decision: true },
			});
		}
	),
});
