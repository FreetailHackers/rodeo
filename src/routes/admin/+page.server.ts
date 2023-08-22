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
	};
};

export const actions = {
	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		let confirmBy: Date | null;
		try {
			confirmBy = dayjs
				.tz(formData.get('confirmBy') as string, formData.get('timezone') as string)
				.toDate();
		} catch (e) {
			confirmBy = null;
		}
		await trpc(locals.auth).settings.update({
			applicationOpen,
			confirmBy,
		});
		return 'Saved settings!';
	},
};
