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

export const actions = {
	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const timezone = formData.get('timezone') as string;
		const applicationOpen = formData.get('applicationOpen') === 'on';
		let confirmBy: Date | null;
		try {
			confirmBy = dayjs.tz(formData.get('confirmBy') as string, timezone).toDate();
		} catch (e) {
			confirmBy = null;
		}
		const scanActions = (formData.get('scanActions') as string)
			.split('\r\n')
			.map((option: string) => option.trim())
			.filter(Boolean);
		await trpc(locals.auth).settings.update({
			applicationOpen,
			confirmBy,
			scanActions,
			timezone,
		});
		return 'Saved settings!';
	},

	release: async ({ locals }) => {
		await trpc(locals.auth).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},
};
