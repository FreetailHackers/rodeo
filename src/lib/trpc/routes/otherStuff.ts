import { CategoryType, type OtherStuff } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const otherStuffSchema = z
	.object({
		title: z.string(),
		response: z.string(),
		type: z.nativeEnum(CategoryType),
	})
	.strict();

export const faqRouter = t.router({
	/**
	 * Gets all the records in the table, sorted by type, id
	 */
	getAll: t.procedure.query(async (): Promise<OtherStuff[]> => {
		return await prisma.otherStuff.findMany({
			orderBy: [{ type: 'asc', id: 'asc' }],
		});
	}),

	// /**
	//  * Gets all of the records in the OtherStuff table depending on the type, sorted by id
	//  */
	// getAllOfType: t.procedure.query(async(): Promise<OtherStuff[]> => {
	// 	.input(z.nativeEnum(CategoryType))

	// 	return await prisma.otherStuff.findMany({
	// 		orderBy: [{ type: requestAnimationFr , id: 'asc' }],
	// 	});
	// }),

	/**
	 * Gets an FAQ by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<OtherStuff | null> => {
		return await prisma.otherStuff.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an FAQ to the page. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate(['ADMIN']))
		.input(otherStuffSchema)
		.mutation(async (req): Promise<void> => {
			console.log('bob');
			console.log(req.input);
			console.log('said hi');
			await prisma.otherStuff.create({ data: { ...req.input } });
		}),

	/**
	 * Updates an FAQ in the page by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(otherStuffSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.otherStuff.update({
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
			await prisma.otherStuff.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all events from the page. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		await prisma.otherStuff.deleteMany();
	}),
});
