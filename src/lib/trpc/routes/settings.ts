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
		showGroups: z.boolean().optional(),
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
			};
		},
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

	// 	/**
	// 	 * Admin-only TRPC mutation to update blacklist settings
	// 	 * Cleans (trim/lowercase), removes duplicates, and saves emails/names to the settings table
	// 	 */

	// 	updateBlacklist: t.procedure
	//   .use(authenticate(['ADMIN']))
	//   .input(z.object({ emails: z.array(z.string()).default([]), names: z.array(z.string()).default([]) }))
	//   .mutation(async (req) => {
	//     const normEmail = (s: string) => s.trim().toLowerCase();
	//     const normName  = (s: string) => s.trim();

	//     const emails = Array.from(new Set(req.input.emails.map(normEmail))).filter(Boolean);
	//     const names  = Array.from(new Set(req.input.names.map(normName))).filter(Boolean);

	//     await prisma.$transaction(async (tx) => {
	//       await tx.blacklist.deleteMany({ where: { type: 'email', NOT: { value: { in: emails } } } });
	//       await tx.blacklist.deleteMany({ where: { type: 'name',  NOT: { value: { in: names  } } } });

	//       await Promise.all(
	//         emails.map((v) =>
	//           tx.blacklist.upsert({ where: { type_value: { type: 'email', value: v } }, update: {}, create: { type: 'email', value: v } }),
	//         ),
	//       );
	//       await Promise.all(
	//         names.map((v) =>
	//           tx.blacklist.upsert({ where: { type_value: { type: 'name', value: v } }, update: {}, create: { type: 'name', value: v } }),
	//         ),
	//       );

	//       // optional: clear old columns so there's no drift
	//     //   await tx.settings.upsert({
	//     //     where: { id: 0 },
	//     //     update: { blacklistEmails: [], blacklistNames: [] },
	//     //     create: { id: 0, blacklistEmails: [], blacklistNames: [] },
	//     //   });
	//     });

	//     return { emails, names };
	//   }),

	//    /**
	//    * Returns blacklist as arrays, derived from the Blacklist table.
	//    * Keeps the same shape (emails[], names[]) your UI expects.
	//    */
	// 		getBlacklist: t.procedure
	// 		.use(authenticate(['ADMIN']))
	// 		.query(async () => {
	// 		  const rows = await prisma.blacklist.findMany();
	// 		  const emails = rows.filter((r) => r.type === 'email').map((r) => r.value);
	// 		  const names  = rows.filter((r) => r.type === 'name').map((r) => r.value);
	// 		  return { emails, names };
	// 		}),

	// 	  /**
	// 	   * Adds one entry to the Blacklist table (email or name).
	// 	   * Uses composite unique (type,value) so upsert is safe/idempotent.
	// 	   * Returns a short message so the client can raise a toast.
	// 	   */
	// 	  addToBlacklist: t.procedure
	// 		.use(authenticate(['ADMIN']))
	// 		.input(z.object({ kind: z.enum(['email', 'name']), value: z.string() }))
	// 		.mutation(async (req) => {
	// 		  const trimmed = req.input.value.trim();
	// 		  await prisma.blacklist.upsert({
	// 			where: { type_value: { type: req.input.kind, value: trimmed } },
	// 			update: {},
	// 			create: { type: req.input.kind, value: trimmed },
	// 		  });
	// 		  return 'Added to blacklist.';
	// 		}),

	// 	  /**
	// 	   * Removes one entry from the Blacklist table by (type,value).
	// 	   * Returns a short message so the client can raise a toast.
	// 	   */
	// 	  removeFromBlacklist: t.procedure
	// 		.use(authenticate(['ADMIN']))
	// 		.input(z.object({ kind: z.enum(['email', 'name']), value: z.string() }))
	// 		.mutation(async (req) => {
	// 		  const trimmed = req.input.value.trim();
	// 		  await prisma.blacklist.delete({
	// 			where: { type_value: { type: req.input.kind, value: trimmed } },
	// 		  });
	// 		  return 'Removed from blacklist.';
	// 		}),
	// });
});
