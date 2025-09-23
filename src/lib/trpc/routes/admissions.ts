// src/lib/trpc/routes/admissions.ts
import type { Prisma, Status } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { sendEmail } from '../email';
import { authenticate } from '../middleware';
import { t } from '../t';
import { getSettings } from './settings';
import { Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { checkWatchlist } from '../../blacklist';

type AppliedUser = Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }> & {
	isBlacklisted: boolean;
};

/** Helper: are applications open given deadline/limit? */
export async function canApplyWindowOk(): Promise<boolean> {
	const settings = await getSettings();
	const count = await prisma.authUser.count({
		where: { status: { in: ['APPLIED', 'ACCEPTED', 'CONFIRMED'] } },
	});

	const deadlineOk =
		settings.applicationDeadline === null ||
		settings.applicationDeadline === undefined ||
		settings.applicationDeadline > new Date();

	const limitOk =
		settings.applicationLimit === null ||
		settings.applicationLimit === undefined ||
		count <= settings.applicationLimit;

	return Boolean(settings.applicationOpen && deadlineOk && limitOk);
}

async function releaseDecisions(ids?: string[]): Promise<void> {
	const hackers = await prisma.user.findMany({
		include: { authUser: true, decision: true },
		where: ids === undefined ? {} : { authUserId: { in: ids } },
	});

	// Safety: decisions should only exist for APPLIED/WAITLISTED
	const invalid = hackers
		.filter((h) => !['APPLIED', 'WAITLISTED'].includes(h.authUser.status))
		.map((h) => h.authUserId);

	await prisma.decision.deleteMany({ where: { userId: { in: invalid } } });

	for (const decision of ['ACCEPTED', 'REJECTED', 'WAITLISTED'] as const) {
		const decisions = hackers.filter((h) => h.decision?.status === decision);

		const updateStatus = prisma.authUser.updateMany({
			where: { id: { in: decisions.map((d) => d.authUserId) } },
			data: { status: decision as Status },
		});

		const deleteDecision = prisma.decision.deleteMany({
			where: { userId: { in: decisions.map((d) => d.authUserId) } },
		});

		await prisma.$transaction([updateStatus, deleteDecision]);

		// email template selection
		const settings = await getSettings();
		let template = '';
		let isHTML = false;
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

		// batch emails
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
	canApply: t.procedure.query(async ({ ctx }) => {
		// 1) window/limit
		const windowOk = await canApplyWindowOk();
		if (!windowOk) return false;

		// 2) blacklist via Settings arrays
		const settings = await getSettings();

		const email = ctx.locals?.user?.email?.trim() ?? '';
		const displayName = ctx.locals?.user?.githubUsername ?? ctx.locals?.user?.email ?? '';

		const emails = (settings.blacklistEmails ?? []).map((e) => e.toLowerCase().trim());
		const names = (settings.blacklistNames ?? []).map((n) => n.toLowerCase().trim());

		const emailBlocked = email ? emails.includes(email.toLowerCase()) : false;
		const nameBlocked = displayName
			? names.some((n) => displayName.toLowerCase().includes(n))
			: false;

		return !(emailBlocked || nameBlocked);
	}),

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
			// Load blacklist once
			const settings = await getSettings();
			const lists = {
				blacklistEmails: settings.blacklistEmails ?? [],
				blacklistNames: settings.blacklistNames ?? [],
			};

			const blocked: { id: string; email?: string }[] = [];

			for (const id of req.input.ids) {
				const hacker = await prisma.user.findUnique({
					where: { authUserId: id },
					include: { authUser: true, decision: true },
				});
				if (!hacker) continue;

				const answersJoined =
					typeof hacker.application === 'object'
						? JSON.stringify(hacker.application)
						: String(hacker.application ?? '');

				const first =
					(hacker.application as any)?.firstName || (hacker.application as any)?.name || '';
				const last = (hacker.application as any)?.lastName || '';
				const fullName = [first, last].filter(Boolean).join(' ').trim();

				const isWatchlisted = checkWatchlist(
					hacker.authUser?.email,
					fullName,
					answersJoined,
					lists,
				);

				// HARD BLOCK accept for watchlisted
				if (req.input.decision === 'ACCEPTED' && isWatchlisted) {
					blocked.push({ id, email: hacker.authUser?.email });
					continue;
				}

				// Only create decisions for APPLIED/WAITLISTED
				if (hacker.authUser.status === 'APPLIED' || hacker.authUser.status === 'WAITLISTED') {
					await prisma.decision.upsert({
						where: { userId: id },
						create: { userId: id, status: req.input.decision },
						update: { status: req.input.decision },
					});
				}
			}

			if (blocked.length > 0) {
				const list = blocked.map((b) => b.email ?? b.id).join(', ');
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: `Watchlisted applicant(s) cannot be accepted: ${list}`,
				});
			}
		}),

	/** Gets all decisions. User must be an admin. */
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

	/** Releases all decisions. User must be an admin. */
	releaseAllDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.mutation(async (): Promise<void> => {
			await releaseDecisions();
		}),

	/** Bulk releases a list of pending decisions by user ID. Admin only. */
	releaseDecisions: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.array(z.string()))
		.mutation(async (req): Promise<void> => {
			await releaseDecisions(req.input);
		}),

	/** Gets one user who submitted an application. Admin only. */
	getAppliedUser: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.object({ role: z.nativeEnum(Role) }))
		.query(async (req): Promise<AppliedUser | null> => {
			const user = await prisma.user.findFirst({
				where: {
					authUser: {
						roles: { has: req.input.role },
						status: { in: ['APPLIED', 'WAITLISTED'] },
					},
					decision: null,
				},
				include: { authUser: true, decision: true },
				orderBy: [{ teamId: 'asc' }],
			});

			if (!user) return null;

			const settings = await getSettings();

			const answersJoined =
				typeof user.application === 'object'
					? JSON.stringify(user.application)
					: String(user.application ?? '');

			const first = (user.application as any)?.firstName || (user.application as any)?.name || '';
			const last = (user.application as any)?.lastName || '';
			const fullName = [first, last].filter(Boolean).join(' ').trim();

			const isBlacklisted = checkWatchlist(
				user.authUser?.email,
				fullName || user.authUser?.githubUsername || user.authUser?.email || '',
				answersJoined,
				{
					blacklistEmails: settings.blacklistEmails ?? [],
					blacklistNames: settings.blacklistNames ?? [],
				},
			);

			return { ...user, isBlacklisted };
		}),
});
