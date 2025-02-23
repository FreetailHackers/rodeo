import type { FAQ } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const faqSchema = z
	.object({
		question: z.string(),
		answer: z.string(),
	})
	.strict();

export const faqRouter = t.router({
	/**
	 * Gets all the FAQ records in the table
	 */
	getAll: t.procedure.query(async (): Promise<FAQ[]> => {
		return await prisma.fAQ.findMany({
			orderBy: { id: 'asc' },
		});
	}),

	/**
	 * Gets a record by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<FAQ | null> => {
		return await prisma.fAQ.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an record to the page. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(faqSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.fAQ.create({ data: { ...req.input } });
		}),

	/**
	 * Updates a record in the page by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(faqSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.fAQ.update({
				where: { id: req.input.id },
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes a FAQ record from the table by ID. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.fAQ.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all FAQs. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		await prisma.fAQ.deleteMany();
	}),
});
