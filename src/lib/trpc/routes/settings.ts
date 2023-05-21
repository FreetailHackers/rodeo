import type { Settings } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const settingsSchema = z
	.object({
		applicationOpen: z.boolean().optional(),
		confirmBy: z.date().nullable().optional(),
		info: z.string().optional(),
		homepageText: z.string().optional(),
		rollingAdmissions: z.boolean().optional(),
		submitTemplate: z.string().optional(),
		acceptTemplate: z.string().optional(),
		rejectTemplate: z.string().optional(),
		waitlistTemplate: z.string().optional(),
		confirmTemplate: z.string().optional(),
		declineTemplate: z.string().optional(),
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
		async (): Promise<{
			homepageText: string;
			applicationOpen: boolean;
			confirmBy: Date | null;
			info: string;
		}> => {
			const settings = await getSettings();
			return {
				homepageText: settings.homepageText,
				applicationOpen: settings.applicationOpen,
				confirmBy: settings.confirmBy,
				info: settings.info,
			};
		}
	),

	/**
	 * Get all settings. User must be an admin.
	 */
	getAll: t.procedure.use(authenticate(['ADMIN'])).query(async (): Promise<Settings> => {
		return await getSettings();
	}),

	/**
	 * Sets the given settings to the given values. User must be an
	 * admin.
	 */
	update: t.procedure
		.use(authenticate(['ADMIN']))
		.input(settingsSchema)
		.mutation(async (req): Promise<void> => {
			await prisma.settings.upsert({
				where: { id: 0 },
				update: req.input,
				create: { id: 0, ...req.input },
			});
		}),
});
