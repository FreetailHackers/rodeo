import type { Prisma, Status } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmails } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';

/**
 * Considers applicationOpen, applicationDeadline, and applicationLimit
 * to determine whether or not new users can apply.
 * User must be an admin.
 */
export const canApply = async (): Promise<boolean> => {
	const settings = await getSettings();
	const count = await prisma.authUser.count({
		where: {
			status: { in: ['APPLIED', 'ACCEPTED', 'CONFIRMED'] },
		},
	});
	return (
		settings.applicationOpen &&
		(settings.applicationDeadline === null || settings.applicationDeadline > new Date()) &&
		(settings.applicationLimit === null || count <= settings.applicationLimit)
	);
};

async function releaseDecisions(ids?: string[]): Promise<void> {
	const hackers = await prisma.user.findMany({
		include: { authUser: true, decision: true },
		where: ids === undefined ? {} : { authUserId: { in: ids } },
	});
	// The codebase should already enforce that decisions can only exist
	// for users with status APPLIED or WAITLISTED, but check for safety
	const invalid = hackers
		.filter((hacker) => !['APPLIED', 'WAITLISTED'].includes(hacker.authUser.status))
		.map((hacker) => hacker.authUserId);
	await prisma.decision.deleteMany({ where: { userId: { in: invalid } } });
	for (const decision of ['ACCEPTED', 'REJECTED', 'WAITLISTED']) {
		const decisions = hackers.filter((hacker) => hacker.decision?.status === decision);
		const updateStatus = prisma.authUser.updateMany({
			where: { id: { in: decisions.map((decision) => decision.authUserId) } },
			data: { status: decision as Status },
		});
		const deleteDecision = prisma.decision.deleteMany({
			where: { userId: { in: decisions.map((decision) => decision.authUserId) } },
		});
		await prisma.$transaction([updateStatus, deleteDecision]);

		let template = '';
		if (decision === 'ACCEPTED') {
			template = (await getSettings()).acceptTemplate;
		} else if (decision === 'REJECTED') {
			template = (await getSettings()).rejectTemplate;
		} else if (decision === 'WAITLISTED') {
			template = (await getSettings()).waitlistTemplate;
		}
		await sendEmails(
			decisions.map((hacker) => hacker.authUser.email),
			'Freetail Hackers status update',
			template
		);
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
			await releaseDecisions();
		}),

	/**
	 * Bulk releases a list of pending decisions by user ID. User must
	 * be an admin. This will send out email notifications.
	 */
	releaseDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async (req): Promise<void> => {
			await releaseDecisions(req.input);
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
						roles: { has: 'HACKER' },
						status: { in: ['APPLIED', 'WAITLISTED'] },
					},
					decision: null,
				},
				include: { authUser: true, decision: true },
			});
		}
	),

	canApply: t.procedure.query(async (): Promise<boolean> => {
		return await canApply();
	}),
});
