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
		});
		return 'Saved settings!';
	},

	release: async ({ locals }) => {
		await trpc(locals.auth).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},

	splitCustomGroups: async ({ locals, request }) => {
		const formData = await request.formData();
		const groups = formData.get('splitGroups') as string;
		const groupNames = groups.split(',').map((name) => name.trim());

		const isValid = groupNames.every((group) => group.trim().length > 0);

		if (!isValid) {
			return 'Please enter valid group names separated by commas.';
		}

		await trpc(locals.auth).users.splitGroups(groupNames);
		console.log(await trpc(locals.auth).users.getAllGroups());
		return 'Groups successfully split and updated!';
	},

	splitGroups: async ({ locals, request }) => {
		const formData = await request.formData();
		const groups = parseInt(formData.get('maxGroups') as string);
		const groupNames: string[] = [];

		for (let i = 0; i < groups; i++) {
			// Generate group name using ASCII code for letters
			groupNames.push(String.fromCharCode(65 + i));
		}

		console.log(groupNames);

		await trpc(locals.auth).users.splitGroups(groupNames);
		console.log(await trpc(locals.auth).users.getAllGroups());
		return 'Groups successfully split and updated!';
	},
};
