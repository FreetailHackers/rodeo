import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	const events = await trpc(locals.auth).events.getAll();
	const settings = await trpc(locals.auth).settings.getPublic();
	return {
		schedule: events,
		user: (await locals.auth.validate())?.user,
		timezone: settings.timezone,
	};
};

export const actions = {
	default: async ({ locals, request }) => {
		const timezone = (await trpc(locals.auth).settings.getPublic()).timezone;
		const formData = await request.formData();
		const fixedStartTime = dayjs.tz(formData.get('start') as string, timezone).toDate();
		const fixedEndTime = dayjs.tz(formData.get('end') as string, timezone).toDate();

		await trpc(locals.auth).events.create({
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
		return 'Created event!';
	},
};
