import { Role, type Event } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

export const eventsRouter = t.router({
	/**
	 * Gets all events in the schedule, sorted by start time.
	 */
	getAll: t.procedure.query(async (): Promise<Event[]> => {
		return await prisma.event.findMany({
			orderBy: [{ start: 'asc' }],
		});
	}),

	/**
	 * Gets an event by ID.
	 */
	get: t.procedure.input(z.number()).query(async (req): Promise<Event | null> => {
		return await prisma.event.findUnique({ where: { id: req.input } });
	}),

	/**
	 * Adds an event to the schedule. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate)
		.input(
			z.object({
				name: z.string(),
				start: z.date(),
				end: z.date(),
				description: z.string(),
				type: z.string(),
				location: z.string(),
			})
		)
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}

			await prisma.event.create({
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes an event from the schedule. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate)
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			await prisma.event.delete({ where: { id: req.input } });
		}),
});
