import type { Settings } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware';
import { t } from '../t';

const settingsSchema = z
	.object({
		applicationOpen: z.boolean().optional(),
		daysToRSVP: z.number().nullable().optional(),
		homepageText: z.string().optional(),
		rollingAdmissions: z.boolean().optional(),
		submitTemplate: z.string().optional(),
		acceptTemplate: z.string().optional(),
		rejectTemplate: z.string().optional(),
		waitlistTemplate: z.string().optional(),
		confirmTemplate: z.string().optional(),
		declineTemplate: z.string().optional(),
		withdrawalWarningTemplate: z.string().optional(),
		scanActions: z.string().array().optional(),
		timezone: z.string().optional(),
		applicationDeadline: z.date().nullable().optional(),
		hackathonStartDate: z.date().nullable().optional(),
		applicationLimit: z.number().nullable().optional(),
		showAnnouncements: z.boolean().optional(),
		showSchedule: z.boolean().optional(),
		showFAQ: z.boolean().optional(),
		showChallenges: z.boolean().optional(),
		showSponsors: z.boolean().optional(),
		submitIsHTML: z.boolean().optional(),
		acceptIsHTML: z.boolean().optional(),
		rejectIsHTML: z.boolean().optional(),
		waitlistIsHTML: z.boolean().optional(),
		confirmIsHTML: z.boolean().optional(),
		declineIsHTML: z.boolean().optional(),
		withdrawIsHTML: z.boolean().optional(),
		byStatusIsHTML: z.boolean().optional(),
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
			daysToRSVP: number | null;
			scanActions: string[];
			timezone: string;
			applicationDeadline: Date | null;
			hackathonStartDate: Date | null;
			showAnnouncements: boolean;
			showSchedule: boolean;
			showFAQ: boolean;
			showChallenges: boolean;
			showSponsors: boolean;
			submitIsHTML: boolean;
			acceptIsHTML: boolean;
			rejectIsHTML: boolean;
			waitlistIsHTML: boolean;
			confirmIsHTML: boolean;
			declineIsHTML: boolean;
			withdrawIsHTML: boolean;
			byStatusIsHTML: boolean;
			spongebobCase: boolean;
		}> => {
			const settings = await getSettings();
			return {
				homepageText: settings.homepageText,
				applicationOpen: settings.applicationOpen,
				daysToRSVP: settings.daysToRSVP,
				scanActions: settings.scanActions,
				timezone: settings.timezone,
				applicationDeadline: settings.applicationDeadline,
				hackathonStartDate: settings.hackathonStartDate,
				showAnnouncements: settings.showAnnouncements,
				showSchedule: settings.showSchedule,
				showFAQ: settings.showFAQ,
				showChallenges: settings.showChallenges,
				showSponsors: settings.showSponsors,
				submitIsHTML: settings.submitIsHTML,
				acceptIsHTML: settings.acceptIsHTML,
				rejectIsHTML: settings.rejectIsHTML,
				waitlistIsHTML: settings.waitlistIsHTML,
				confirmIsHTML: settings.confirmIsHTML,
				declineIsHTML: settings.declineIsHTML,
				withdrawIsHTML: settings.withdrawIsHTML,
				byStatusIsHTML: settings.byStatusIsHTML,
				spongebobCase: settings.spongebobCase,
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
