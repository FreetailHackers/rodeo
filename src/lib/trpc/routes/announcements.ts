import { Role, type Announcement } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

export const announcementsRouter = t.router({
	/**
	 * Gets all announcements.
	 */
	getAll: t.procedure.query(async (): Promise<Announcement[]> => {
		return await prisma.announcement.findMany({
			orderBy: [{ published: 'desc' }],
		});
	}),

	/**
	 * Creates a new announcement. User must be an admin.
	 */
	create: t.procedure
		.use(authenticate)
		.input(z.string().min(1))
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			await prisma.announcement.create({ data: { body: req.input } });
		}),

	/**
	 * Deletes an announcement by ID. User must be an admin.
	 */
	delete: t.procedure
		.use(authenticate)
		.input(z.number())
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			await prisma.announcement.delete({ where: { id: req.input } });
		}),
});
