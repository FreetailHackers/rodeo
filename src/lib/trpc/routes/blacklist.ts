import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

//normalization helper
export const normalizeEmail = (input?: string) => (input ?? '').toLowerCase().trim();

export const normalizeName = (input?: string) =>
	(input ?? '')
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim()
		.replace(/\s+/g, ' ');

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const blacklistRouter = t.router({
	/**
	 * Fetch all blacklist entries, split into emails and names.
	 */
	get: t.procedure.use(authenticate(['ADMIN'])).query(async () => {
		const entries = await prisma.blacklist.findMany();
		return {
			emails: entries.filter((entry) => entry.type === 'email').map((entry) => entry.value),
			names: entries.filter((entry) => entry.type === 'name').map((entry) => entry.value),
		};
	}),

	/**
	 * Replace the entire blacklist with the provided arrays of emails and names.
	 * - Normalizes values (emails → lowercase/trim, names → lower/trim/diacritics removed/space-collapsed).
	 * - Deletes entries not in the new list.
	 * - Inserts new entries, skipping duplicates.
	 */
	replace: t.procedure
		.use(authenticate(['ADMIN']))
		.input(
			z.object({
				emails: z.array(z.string()).default([]),
				names: z.array(z.string()).default([]),
			}),
		)
		.mutation(async (requestContext) => {
			const normalizedEmails = [...new Set(requestContext.input.emails.map(normalizeEmail))].filter(
				Boolean,
			);
			const normalizedNames = [...new Set(requestContext.input.names.map(normalizeName))].filter(
				Boolean,
			);

			await prisma.$transaction(async (transaction) => {
				await transaction.blacklist.deleteMany({
					where: { type: 'email', NOT: { value: { in: normalizedEmails } } },
				});
				await transaction.blacklist.deleteMany({
					where: { type: 'name', NOT: { value: { in: normalizedNames } } },
				});

				if (normalizedEmails.length > 0) {
					await transaction.blacklist.createMany({
						data: normalizedEmails.map((emailValue) => ({ type: 'email', value: emailValue })),
						skipDuplicates: true,
					});
				}
				if (normalizedNames.length > 0) {
					await transaction.blacklist.createMany({
						data: normalizedNames.map((nameValue) => ({ type: 'name', value: nameValue })),
						skipDuplicates: true,
					});
				}
			});

			return { emails: normalizedEmails, names: normalizedNames };
		}),

	/**
	 * Add a single blacklist entry (email or name).
	 * - Normalizes the value.
	 * - Skips insertion if the entry already exists.
	 */
	add: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.object({ kind: z.enum(['email', 'name']), value: z.string() }))
		.mutation(async (requestContext) => {
			const normalizedValue =
				requestContext.input.kind === 'email'
					? normalizeEmail(requestContext.input.value)
					: normalizeName(requestContext.input.value);

			if (!normalizedValue) return 'Skipped (empty after normalization).';

			await prisma.blacklist.createMany({
				data: [{ type: requestContext.input.kind, value: normalizedValue }],
				skipDuplicates: true,
			});

			return 'Added to blacklist.';
		}),

	/**
	 * Remove a single blacklist entry (email or name).
	 * - Normalizes the value.
	 * - Deletes the exact match from the DB.
	 */
	remove: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.object({ kind: z.enum(['email', 'name']), value: z.string() }))
		.mutation(async (requestContext) => {
			const normalizedValue =
				requestContext.input.kind === 'email'
					? normalizeEmail(requestContext.input.value)
					: normalizeName(requestContext.input.value);

			await prisma.blacklist.deleteMany({
				where: {
					type: requestContext.input.kind,
					value: normalizedValue,
				},
			});

			return 'Removed from blacklist.';
		}),

	check: t.procedure
		.use(authenticate(['ADMIN'])) // pick the roles you want
		.input(
			z.object({
				email: z.string().optional(),
				answers: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			return await checkIfBlacklisted(input.email, input.answers);
		}),
});

/**
 * Check whether a user is blacklisted by email or name,
 * including scanning their application answers (like the old settings-based version).
 */
export async function checkIfBlacklisted(email?: string, answersJoined?: string): Promise<boolean> {
	const normalizedEmail = normalizeEmail(email || '');
	const normalizedAnswers = normalizeName(answersJoined || '');

	// Exact email in DB
	if (normalizedEmail) {
		const emailRow = await prisma.blacklist.findUnique({
			where: { type_value: { type: 'email', value: normalizedEmail } },
			select: { id: true },
		});
		if (emailRow) return true;
	}

	// Email string mentioned inside answers blob
	if (normalizedEmail && normalizedAnswers.includes(normalizedEmail)) {
		return true;
	}

	// Any blacklisted name token present in answers (word-boundary, normalized)
	if (normalizedAnswers) {
		const nameRows = await prisma.blacklist.findMany({
			where: { type: 'name' },
			select: { value: true },
		});

		const hasNameHit = nameRows.some(({ value }) => {
			const token = normalizeName(value);
			if (!token) return false;
			const re = new RegExp(`\\b${escapeRegExp(token)}\\b`);
			return re.test(normalizedAnswers);
		});

		if (hasNameHit) return true;
	}

	return false;
}
