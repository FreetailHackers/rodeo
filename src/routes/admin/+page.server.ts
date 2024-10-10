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
		allHackers: await trpc(locals.auth).users.getAllHackers(),
		appliedHackers: await trpc(locals.auth).users.getAppliedHackers(),
	};
};

export const actions = {
	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const timezone = formData.get('timezone') as string;

		let hackathonStartDate: Date | null;
		let applicationDeadline: Date | null;
		try {
			applicationDeadline = dayjs
				.tz(formData.get('applicationDeadline') as string, timezone)
				.toDate();
		} catch (e) {
			applicationDeadline = null;
		}
		try {
			hackathonStartDate = dayjs
				.tz(formData.get('hackathonStartDate') as string, timezone)
				.toDate();
		} catch (e) {
			hackathonStartDate = null;
		}
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

	updateMissedStatus: async ({ locals }) => {
		console.log('updating missed status');
		await trpc(locals.auth).users.updateMissedStatus();
		console.log('done updating missed status');
		return 'Updated missed status!';
	},
};
