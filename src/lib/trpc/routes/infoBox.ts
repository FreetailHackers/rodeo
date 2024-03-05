import { CategoryType, type InfoBox } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const infoBoxSchema = z
	.object({
		title: z.string(),
		response: z.string(),
		category: z.nativeEnum(CategoryType),
	})
	.strict();

export const infoBoxRouter = t.router({
	/**
	 * Gets all the records in the table by category
	 */
	getAllOfCategory: t.procedure
		.input(z.nativeEnum(CategoryType))
		.query(async (req): Promise<InfoBox[]> => {
			return await prisma.infoBox.findMany({
				orderBy: { id: 'asc' },
				where: { category: req.input },
			});
		}),

	/**
	 * Gets a record by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<InfoBox | null> => {
		return await prisma.infoBox.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an record to the page. User must be an admin. Category type assigned
	 * when created.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(infoBoxSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.infoBox.create({ data: { ...req.input } });
		}),

	/**
	 * Updates a record in the page by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(infoBoxSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.infoBox.update({
				where: { id: req.input.id },
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes a record from the table by ID. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.infoBox.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all InfoBox from the page by category. User must be an admin.
	 */
	deleteAllOfCategory: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.nativeEnum(CategoryType))
		.mutation(async (req): Promise<void> => {
			await prisma.infoBox.deleteMany({ where: { category: req.input } });
		}),
});
