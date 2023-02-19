import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return {
		schedule: await trpc(cookies).getSchedule(),
		user: await trpc(cookies).getUser(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	schedule: async ({ cookies, request }) => {
		const formData = await request.formData();
		trpc(cookies).addScheduleEvent({
			schedule: formData.get('schedule') as string,
			description: formData.get('description') as string,
			startTime: new Date(formData.get('startTime') as string),
			endTime: new Date(formData.get('endTime') as string),
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
		formData.get('schedule');
	},
};
