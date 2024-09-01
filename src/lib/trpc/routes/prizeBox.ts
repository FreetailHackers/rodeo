import { PrizeType, type PrizeBox } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const prizeBoxSchema = z
	.object({
		title: z.string(),
		prize: z.string().optional(),
		description: z.string(),
		prizeType: z.nativeEnum(PrizeType),
	})
	.strict();

export const prizeBoxRouter = t.router({
	/**
	 * Gets all the records in the table by category
	 */
	getAllOfCategory: t.procedure
		.input(z.nativeEnum(PrizeType))
		.query(async (req): Promise<PrizeBox[]> => {
			return await prisma.prizeBox.findMany({
				orderBy: { id: 'asc' },
				where: { prizeType: req.input },
			});
		}),

	/**
	 * Gets all the records in the table by category
	 */
	getAll: t.procedure.query(async (): Promise<PrizeBox[]> => {
		return await prisma.prizeBox.findMany({
			orderBy: { id: 'asc' },
		});
	}),

	/**
	 * Gets a record by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<PrizeBox | null> => {
		return await prisma.prizeBox.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an record to the page. User must be an admin. Category type assigned
	 * when created.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(prizeBoxSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.prizeBox.create({ data: { ...req.input } });
		}),

	/**
	 * Updates a record in the page by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(prizeBoxSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.prizeBox.update({
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
			await prisma.prizeBox.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all PrizeBox from the page by category. User must be an admin.
	 */
	deleteAllOfCategory: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.nativeEnum(PrizeType))
		.mutation(async (req): Promise<void> => {
			await prisma.prizeBox.deleteMany({ where: { prizeType: req.input } });
		}),
});
