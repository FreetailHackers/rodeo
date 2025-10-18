import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';
import { Role, Status } from '@prisma/client';
import { checkIfBlacklisted } from './blacklist';
import { getQuestions } from './questions';

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
		let isHTML: boolean = false;
		const settings = await getSettings();
		if (decision === 'ACCEPTED') {
			template = settings.acceptTemplate;
			isHTML = settings.acceptIsHTML;
		} else if (decision === 'REJECTED') {
			template = settings.rejectTemplate;
			isHTML = settings.rejectIsHTML;
		} else if (decision === 'WAITLISTED') {
			template = settings.waitlistTemplate;
			isHTML = settings.waitlistIsHTML;
		}

		for (let i = 0; i < decisions.length; i += 100) {
			await Promise.all(
				decisions
					.slice(i, i + 100)
					.map((hacker) =>
						sendEmail(hacker.authUser.email, 'Freetail Hackers status update', template, isHTML),
					),
			);
		}
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
			}),
		)
		.mutation(async (req): Promise<void> => {
			const questions = await getQuestions();
			const firstNameQuestion = questions.find((q) => /^first\s+name$/i.test(q.label));
			const lastNameQuestion = questions.find((q) => /^last\s+name$/i.test(q.label));

			for (const id of req.input.ids) {
				const user = await prisma.authUser.findUniqueOrThrow({
					where: {
						id: id,
					},
				});

				// fetch application + email to evaluate
				const record = await prisma.user.findUnique({
					where: { authUserId: id },
					include: { authUser: true },
				});
				if (!record) continue;

				const app = record.application as any;
				const firstName = firstNameQuestion ? String(app?.[firstNameQuestion.id] ?? '').trim() : '';
				const lastName = lastNameQuestion ? String(app?.[lastNameQuestion.id] ?? '').trim() : '';
				const fullName = [firstName, lastName].filter(Boolean).join(' ');

				const isBlacklisted = await checkIfBlacklisted(record.authUser?.email, fullName);

				// block Accept and Waitlist if blacklisted
				if (
					(req.input.decision === 'ACCEPTED' || req.input.decision === 'WAITLISTED') &&
					isBlacklisted
				) {
					continue;
				}

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
		},
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
	getAppliedUser: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				role: z.nativeEnum(Role),
				status: z.nativeEnum(Status).optional(),
			}),
		)
		.query(
			async (
				req,
			): Promise<
				| (Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }> & {
						isBlacklisted: boolean;
				  })
				| null
			> => {
				const statusFilter = req.input.status
					? [req.input.status]
					: [Status.APPLIED, Status.WAITLISTED];
				const user = await prisma.user.findFirst({
					where: {
						authUser: {
							roles: { has: req.input.role },
							status: { in: statusFilter },
						},
						decision: null,
					},
					include: { authUser: true, decision: true },
					orderBy: [{ teamId: 'asc' }],
				});

				if (!user) return null;

				const questions = await getQuestions();
				const firstNameQuestion = questions.find((q) => /^first\s+name$/i.test(q.label));
				const lastNameQuestion = questions.find((q) => /^last\s+name$/i.test(q.label));
				const app = user.application as any;
				const firstName = firstNameQuestion ? String(app?.[firstNameQuestion.id] ?? '').trim() : '';
				const lastName = lastNameQuestion ? String(app?.[lastNameQuestion.id] ?? '').trim() : '';
				const fullName = [firstName, lastName].filter(Boolean).join(' ');

				const isBlacklisted = await checkIfBlacklisted(user.authUser?.email, fullName);
				return { ...user, isBlacklisted };
			},
		),

	canApply: t.procedure.query(async (): Promise<boolean> => {
		return await canApply();
	}),
});
