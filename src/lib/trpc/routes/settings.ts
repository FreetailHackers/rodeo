import { Role, type Settings } from '@prisma/client';
import { z } from 'zod';
import prisma from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const settingsSchema = z
	.object({
		applicationOpen: z.boolean().optional(),
		confirmBy: z.date().nullable().optional(),
		info: z.string().optional(),
		rollingAdmissions: z.boolean().optional(),
		acceptanceTemplate: z.string().optional(),
		homepageText: z.string().optional(),
	})
	.strict();

export const getSettings = async (): Promise<Settings> => {
	return await prisma.settings.findUniqueOrThrow({ where: { id: 0 } });
};

export const settingsRouter = t.router({
	/**
	 * Returns public settings.
	 */
	getPublic: t.procedure.query(
		async (): Promise<{ applicationOpen: boolean; confirmBy: Date | null; info: string }> => {
			const settings = await getSettings();
			return {
				applicationOpen: settings.applicationOpen,
				confirmBy: settings.confirmBy,
				info: settings.info,
			};
		}
	),

	/**
	 * Get all settings. User must be an admin.
	 */
	getAll: t.procedure.use(authenticate).query(async (req): Promise<Settings> => {
		if (req.ctx.user.role !== Role.ADMIN) {
			throw new Error('You have insufficient permissions to perform this action.');
		}
		return await getSettings();
	}),

	/**
	 * Sets the given settings to the given values. User must be an
	 * admin.
	 */
	update: t.procedure
		.use(authenticate)
		.input(settingsSchema)
		.mutation(async (req): Promise<void> => {
			if (req.ctx.user.role !== Role.ADMIN) {
				throw new Error('You have insufficient permissions to perform this action.');
			}
			await prisma.settings.upsert({
				where: { id: 0 },
				update: req.input,
				create: { id: 0, ...req.input },
			});
		}),
});
