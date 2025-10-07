import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

export const blacklistRouter = t.router({
	/**
	 * Fetch all blacklist entries, split into emails and names.
	 */
	get: t.procedure.use(authenticate(['ADMIN'])).query(async () => {
		const rows = await prisma.blacklist.findMany();
		return {
			emails: rows.filter((r) => r.type === 'email').map((r) => r.value),
			names: rows.filter((r) => r.type === 'name').map((r) => r.value),
		};
	}),

	/**
	 * Replace the entire blacklist with the provided arrays of emails and names.
	 * - Normalizes values (emails → lowercase, names → trimmed).
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
		.mutation(async (req) => {
			const normEmail = (s: string) => s.trim().toLowerCase();
			const normName = (s: string) => s.trim();

			const emails = [...new Set(req.input.emails.map(normEmail))].filter(Boolean);
			const names = [...new Set(req.input.names.map(normName))].filter(Boolean);

			await prisma.$transaction(async (tx) => {
				await tx.blacklist.deleteMany({ where: { type: 'email', NOT: { value: { in: emails } } } });
				await tx.blacklist.deleteMany({ where: { type: 'name', NOT: { value: { in: names } } } });

				if (emails.length)
					await tx.blacklist.createMany({
						data: emails.map((v) => ({ type: 'email', value: v })),
						skipDuplicates: true,
					});
				if (names.length)
					await tx.blacklist.createMany({
						data: names.map((v) => ({ type: 'name', value: v })),
						skipDuplicates: true,
					});
			});

			return { emails, names };
		}),

	/**
	 * Add a single blacklist entry (email or name).
	 * - Normalizes the value.
	 * - Skips insertion if the entry already exists.
	 */
	add: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.object({ kind: z.enum(['email', 'name']), value: z.string() }))
		.mutation(async (req) => {
			const v =
				req.input.kind === 'email' ? req.input.value.trim().toLowerCase() : req.input.value.trim();
			await prisma.blacklist.createMany({
				data: [{ type: req.input.kind, value: v }],
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
		.mutation(async (req) => {
			const v =
				req.input.kind === 'email' ? req.input.value.trim().toLowerCase() : req.input.value.trim();
			await prisma.blacklist.delete({ where: { type_value: { type: req.input.kind, value: v } } });
			return 'Removed from blacklist.';
		}),
});

/**
 * Check whether a user is blacklisted by email or name.
 */
export async function checkIfBlacklisted(email?: string, name?: string): Promise<boolean> {
	const emailBlacklisted = email
		? await prisma.blacklist.findFirst({
				where: { type: 'email', value: email.toLowerCase().trim() },
				select: { id: true },
			})
		: null;

	const nameBlacklisted = name
		? await prisma.blacklist.findFirst({
				where: { type: 'name', value: name.trim() },
				select: { id: true },
			})
		: null;

	return Boolean(emailBlacklisted || nameBlacklisted);
}
