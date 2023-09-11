import { trpc } from '$lib/trpc/router';
import { error } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals, params }) => {
	const event = await trpc(locals.auth).events.get(Number(params.event));
	if (event !== null) {
		return {
			event,
			user: (await locals.auth.validate())?.user,
		};
	}
	throw error(404, 'Event not found');
};

export const actions = {
	saveEdit: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		const fixedStartTime = dayjs
			.tz(formData.get('start') as string, formData.get('timezone') as string)
			.toDate();

		const fixedEndTime = dayjs
			.tz(formData.get('end') as string, formData.get('timezone') as string)
			.toDate();

		await trpc(locals.auth).events.update({
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
