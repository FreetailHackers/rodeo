import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		decisions: await trpc(locals.auth).admissions.getDecisions(),
		settings: await trpc(locals.auth).settings.getAll(),
		graph: await trpc(locals.auth).users.getStatusChanges(),
	};
};

const parseDateWithTimezone = (dateString: string | null, timezone: string): Date | null => {
	try {
		return dateString ? dayjs.tz(dateString, timezone).toDate() : null;
	} catch (e) {
		return null;
	}
};

export const actions = {
	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const timezone = formData.get('timezone') as string;

		const applicationDeadline = parseDateWithTimezone(
			formData.get('applicationDeadline') as string,
			timezone
		);
		const hackathonStartDate = parseDateWithTimezone(
			formData.get('hackathonStartDate') as string,
			timezone
		);

		const applicationLimitRaw = formData.get('applicationLimit');
		let applicationLimit: number | null = parseInt(applicationLimitRaw as string);
		if (isNaN(applicationLimit)) {
			applicationLimit = null;
		}
		const applicationOpen = formData.get('applicationOpen') === 'on';
		const spongebobCase = formData.get('spongebobCase') === 'on';
		const parsedDaysToRSVP = parseInt(formData.get('daysToRSVP') as string, 10);
		const daysToRSVP: number | null = isNaN(parsedDaysToRSVP) ? null : parsedDaysToRSVP;

		const scanActions = (formData.get('scanActions') as string)
			.split('\r\n')
			.map((option: string) => option.trim())
			.filter(Boolean);
		await trpc(locals.auth).settings.update({
			applicationOpen,
			daysToRSVP,
			scanActions,
			timezone,
			applicationDeadline,
			applicationLimit,
			hackathonStartDate,
			spongebobCase,
		});
		return 'Saved settings!';
	},

	release: async ({ locals }) => {
		await trpc(locals.auth).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},

	splitGroups: async ({ locals, request }) => {
		const formData = await request.formData();
		const numGroups = parseInt(formData.get('splitGroups') as string, 10);
		await trpc(locals.auth).users.splitGroups(numGroups);
		return 'Groups successfully split and updated!';
	},
};
