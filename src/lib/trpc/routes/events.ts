import type { Event } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const eventSchema = z
	.object({
		name: z.string(),
		start: z.date(),
		end: z.date(),
		description: z.string(),
		type: z.string(),
		location: z.string(),
	})
	.strict();

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
		.use(authenticate(['ADMIN']))
		.input(eventSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.event.create({ data: { ...req.input } });
		}),

	/**
	 * Updates an event in the schedule by ID. User must be an admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(eventSchema.merge(z.object({ id: z.number() })))
		.mutation(async (req): Promise<void> => {
			await prisma.event.update({
				where: { id: req.input.id },
				data: { ...req.input },
			});
		}),

	/**
	 * Deletes an event from the schedule. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate(['ADMIN']))
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			await prisma.event.delete({ where: { id: req.input } });
		}),

	/**
	 * Deletes all events from the schedule. User must be an admin.
	 */
	deleteAll: t.procedure.use(authenticate(['ADMIN'])).mutation(async (): Promise<void> => {
		await prisma.event.deleteMany();
	}),
});
