import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = (async ({ cookies }) => {
	return {
		schedule: await trpc(cookies).getSchedule(),
		user: await trpc(cookies).getUser(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	schedule: async ({ cookies, request }) => {
		const formData = await request.formData();
		const fixedStartTime = dayjs
			.tz(formData.get('startTime') as string, formData.get('timezone') as string)
			.toDate();

		const fixedEndTime = dayjs
			.tz(formData.get('endTime') as string, formData.get('timezone') as string)
			.toDate();

		await trpc(cookies).addScheduleEvent({
			schedule: formData.get('schedule') as string,
			description: formData.get('description') as string,
			startTime: fixedStartTime,
			endTime: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
	},

	unannounce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid announcement ID.');
		}
		await trpc(cookies).deleteEvent(Number(id));
	},
};
