import { trpc } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ params, cookies }) => {
	const event = await trpc(cookies).events.get(Number(params.event));
	if (event !== null) {
		return {
			event,
			user: await trpc(cookies).users.get(),
		};
	}

	throw error(404, 'Event not found');
};

export const actions: Actions = {
	saveEdit: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid event ID.');
		}

		const fixedStartTime = dayjs
			.tz(formData.get('start') as string, formData.get('timezone') as string)
			.toDate();

		const fixedEndTime = dayjs
			.tz(formData.get('end') as string, formData.get('timezone') as string)
			.toDate();

		await trpc(cookies).events.update({
			id: Number(id),
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
	},
};
