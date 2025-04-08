import type { Challenge } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const challengeSchema = z
	.object({
		title: z.string(),
		prize: z.string().nullable(),
		description: z.string(),
	})
	.strict();

export const challengesRouter = t.router({
	/**
	 * Gets all the challenge records in the table.
	 */
	getAll: t.procedure.query(async (): Promise<Challenge[]> => {
		return await prisma.challenge.findMany({
			orderBy: { id: 'asc' },
		});
	}),

	/**
	 * Gets a record by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<Challenge | null> => {
		return await prisma.challenge.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an record to the page. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(challengeSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.challenge.create({ data: { ...req.input } });
		}),

	/**
	 * Updates a challenge record in the page by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(challengeSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.challenge.update({
				where: { id: req.input.id },
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes a challenge record from the table by ID. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.challenge.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all challenges. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		await prisma.challenge.deleteMany();
	}),
});
