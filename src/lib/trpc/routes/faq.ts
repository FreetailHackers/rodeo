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
	 * Gets all FAQs in the schedule, sorted by id.
	 */
	getAll: t.procedure.query(async (): Promise<FAQ[]> => {
		return await prisma.fAQ.findMany({
			orderBy: [{ id: 'asc' }],
		});
	}),

	/**
	 * Gets an FAQ by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<FAQ | null> => {
		return await prisma.fAQ.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an FAQ to the page. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(faqSchema)
		.mutation(async (req): Promise<void> => {
			console.log('bob');
			console.log(req.input);
			console.log('said hi');
			await prisma.fAQ.create({ data: { ...req.input } });
		}),

	/**
	 * Updates an FAQ in the page by ID. User must be an admin.
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
	 * Deletes an FAQ from the page. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.fAQ.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all events from the page. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		await prisma.fAQ.deleteMany();
	}),
});
