import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return {
		schedule: await trpc(cookies).getSchedule(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	schedule: async ({ cookies, request }) => {
		const formData = await request.formData();
		trpc(cookies).addScheduleEvent({
			schedule: formData.get('schedule') as string,
			date: new Date(formData.get('date') as string),
			description: formData.get('description') as string,
			type: formData.get('type') as string,
		});
		formData.get('schedule');
	},
};
