import { Prisma, Role, Status } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';

export const admissionsRouter = t.router({
	/**
	 * Bulk accepts, rejects, or waitlists a list of IDs of users with
	 * submitted applications. User must be an admin.
	 */
	decide: t.procedure
		.use(authenticate)
		.input(
			z.object({
				decision: z.enum(['ACCEPTED', 'REJECTED', 'WAITLISTED']),
				ids: z.array(z.number()),
			})
		)
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const id of req.input.ids) {
				const user = await prisma.user.findUniqueOrThrow({
					where: {
						id: id,
					},
				});
				if (user.status === Status.APPLIED || user.status === Status.WAITLISTED) {
					await prisma.decision.upsert({
						where: {
							userId: id,
						},
						create: {
							userId: id,
							status: req.input.decision,
						},
						update: {
							status: req.input.decision,
						},
					});
				}
			}
		}),

	/**
	 * Confirms walk-in users who have applied. Logged-in user must be
	 * an admin.
	 */
	confirmWalkIns: t.procedure
		.use(authenticate)
		.input(z.array(z.number()))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const id of req.input) {
				const user = await prisma.user.findUniqueOrThrow({
					where: {
						id: id,
					},
				});
				// NOTE: This if statement is a good argument for why each status should be a boolean
				// Then we could just check if the user has applied at some point
				if (user.status !== Status.CREATED && user.status !== Status.VERIFIED) {
					// Use deleteMany to avoid not found errors
					await prisma.decision.deleteMany({
						where: {
							userId: id,
						},
					});
					await prisma.user.update({
						where: {
							id: id,
						},
						data: {
							status: Status.CONFIRMED,
						},
					});
				}
			}
		}),

	/**
	 * Gets all decisions. User must be an admin.
	 */
	getDecisions: t.procedure.use(authenticate).query(
		async (
			req
		): Promise<{
			accepted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			rejected: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
			waitlisted: Prisma.DecisionGetPayload<{ include: { user: true } }>[];
		}> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return {
				accepted: await prisma.decision.findMany({
					where: { status: Status.ACCEPTED },
					include: { user: true },
				}),
				rejected: await prisma.decision.findMany({
					where: { status: Status.REJECTED },
					include: { user: true },
				}),
				waitlisted: await prisma.decision.findMany({
					where: { status: Status.WAITLISTED },
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
	releaseAllDecisions: t.procedure.use(authenticate).mutation(async (req): Promise<void> => {
		if (req.ctx.user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		const decisions = await prisma.decision.findMany();
		for (const decision of decisions) {
			const updateStatus = prisma.user.update({
				where: {
					id: decision.userId,
					status: { in: [Status.APPLIED, Status.WAITLISTED] },
				},
				data: {
					status: decision.status,
				},
			});
			const deleteDecision = prisma.decision.delete({
				where: {
					id: decision.id,
				},
			});

			const recipient = await prisma.user.findUniqueOrThrow({
				where: {
					id: decision.userId,
				},
			});

			// preconfigured templates, this structure will change later but is a proof of concept
			const subject = 'Freetail Hackers Status Update';

			await prisma.$transaction([updateStatus, deleteDecision]);

			await sendEmail(
				recipient.email,
				subject,
				(
					await getSettings()
				).acceptanceTemplate,
				recipient.preferredName
			);
		}
	}),

	/**
	 * Bulk releases a list of pending decisions by user ID. User must
	 * be an admin. This will send out email notifications.
	 */
	releaseDecisions: t.procedure
		.use(authenticate)
		.input(z.array(z.number()))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			for (const id of req.input) {
				const decision = await prisma.decision.findUniqueOrThrow({
					where: {
						userId: id,
					},
				});
				const updateStatus = prisma.user.update({
					where: {
						id: decision.userId,
						status: { in: [Status.APPLIED, Status.WAITLISTED] },
					},
					data: {
						status: decision.status,
					},
				});
				const deleteDecision = prisma.decision.delete({
					where: {
						id: decision.id,
					},
				});

				const recipient = await prisma.user.findUniqueOrThrow({
					where: {
						id: id,
					},
				});

				// preconfigured templates, this structure will change later but is a proof of concept
				const subject = 'Freetail Hackers Status Update';

				await prisma.$transaction([updateStatus, deleteDecision]);

				await sendEmail(
					recipient.email,
					subject,
					(
						await getSettings()
					).acceptanceTemplate,
					recipient.preferredName
				);
			}
		}),

	/**
	 * Bulk removes a list of pending decisions by user ID. User must be
	 * an admin.
	 */
	removeDecisions: t.procedure
		.use(authenticate)
		.input(z.array(z.number()))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
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
	getAppliedUser: t.procedure
		.use(authenticate)
		.query(async (req): Promise<Prisma.UserGetPayload<{ include: { decision: true } }> | null> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			return await prisma.user.findFirst({
				where: {
					status: { in: [Status.APPLIED, Status.WAITLISTED] },
					decision: null,
				},
				include: { decision: true },
			});
		}),
});
