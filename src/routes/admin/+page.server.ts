import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	return {
		decisions: await trpc(event).admissions.getDecisions(),
		settings: await trpc(event).settings.getAll(),
		graph: await trpc(event).users.getStatusChanges(),
	};
};

const parseDateWithTimezone = (dateString: string | null, timezone: string): Date | null => {
	try {
		return dateString ? dayjs.tz(dateString, timezone).toDate() : null;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return null;
	}
};

export const actions = {
	settings: async (event) => {
		const formData = await event.request.formData();
		const timezone = formData.get('timezone') as string;

		const applicationDeadline = parseDateWithTimezone(
			formData.get('applicationDeadline') as string,
			timezone,
		);
		const hackathonStartDate = parseDateWithTimezone(
			formData.get('hackathonStartDate') as string,
			timezone,
		);

		const applicationLimitRaw = formData.get('applicationLimit');
		let applicationLimit: number | null = parseInt(applicationLimitRaw as string);
		if (isNaN(applicationLimit)) {
			applicationLimit = null;
		}
		const applicationOpen = formData.get('applicationOpen') === 'on';
		const parsedDaysToRSVP = parseInt(formData.get('daysToRSVP') as string, 10);
		const daysToRSVP: number | null = isNaN(parsedDaysToRSVP) ? null : parsedDaysToRSVP;

		const scanActions = (formData.get('scanActions') as string)
			.split('\r\n')
			.map((option: string) => option.trim())
			.filter(Boolean);
		await trpc(event).settings.update({
			applicationOpen,
			daysToRSVP,
			scanActions,
			timezone,
			applicationDeadline,
			applicationLimit,
			hackathonStartDate,
		});
		return 'Saved settings!';
	},

	release: async (event) => {
		await trpc(event).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},

	splitGroups: async (event) => {
		const formData = await event.request.formData();
		const groups = formData.get('splitGroups') as string;
		const groupNames = groups.split(',').map((name) => name.trim());

		const isValid = groupNames.every((group) => group.trim().length > 0);

		if (!isValid) {
			return 'Please enter valid group names separated by commas.';
		}

		await trpc(event).users.splitGroups(groupNames);
		return 'Groups successfully split and updated!';
	},
};
