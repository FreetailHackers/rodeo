import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

//normalization helper
export const normalizeEmail = (input?: string) => (input ?? '').toLowerCase().trim();

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
	 * - Emails are normalized (lowercase + trim).
	 * - Names are kept exact (trim only).
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

			const exactNames = [
				...new Set(requestContext.input.names.map((name) => (name ?? '').trim())),
			].filter(Boolean);

			await prisma.$transaction(async (transaction) => {
				await transaction.blacklist.deleteMany({
					where: { type: 'email', NOT: { value: { in: normalizedEmails } } },
				});
				await transaction.blacklist.deleteMany({
					where: { type: 'name', NOT: { value: { in: exactNames } } },
				});

				if (normalizedEmails.length > 0) {
					await transaction.blacklist.createMany({
						data: normalizedEmails.map((emailValue) => ({ type: 'email', value: emailValue })),
						skipDuplicates: true,
					});
				}
				if (exactNames.length > 0) {
					await transaction.blacklist.createMany({
						data: exactNames.map((nameValue) => ({ type: 'name', value: nameValue })),
						skipDuplicates: true,
					});
				}
			});

			return { emails: normalizedEmails, names: exactNames };
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
					: (requestContext.input.value ?? '').trim();

			if (!normalizedValue) return 'Skipped (empty value).';

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
					: (requestContext.input.value ?? '').trim();

			await prisma.blacklist.deleteMany({
				where: {
					type: requestContext.input.kind,
					value: normalizedValue,
				},
			});

			return 'Removed from blacklist.';
		}),

	check: t.procedure
		.use(authenticate(['ADMIN']))
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
// Keep the export name the same for callers
export async function checkIfBlacklisted(email?: string, fullNameRaw?: string): Promise<boolean> {
	const normalizedEmail = normalizeEmail(email || '');

	// email match
	if (normalizedEmail) {
		const emailRow = await prisma.blacklist.findUnique({
			where: { type_value: { type: 'email', value: normalizedEmail } },
			select: { id: true },
		});
		if (emailRow) return true;
	}

	//name match
	const exactName = (fullNameRaw ?? '').trim();
	if (exactName) {
		const nameRow = await prisma.blacklist.findUnique({
			where: { type_value: { type: 'name', value: exactName } },
			select: { id: true },
		});
		if (nameRow) return true;
	}

	return false;
}
