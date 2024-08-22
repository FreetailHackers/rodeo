import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.event))) {
		throw error(404, 'Event not found');
	}
	const event = await trpc(locals.auth).events.get(Number(params.event));
	const settings = await trpc(locals.auth).settings.getPublic();
	if (event !== null) {
		return {
			event,
			timezone: settings.timezone,
		};
	}
	throw error(404, 'Event not found');
};

export const actions = {
	edit: async ({ locals, request }) => {
		const timezone = (await trpc(locals.auth).settings.getPublic()).timezone;
		const formData = await request.formData();

		const startDate = formData.get('start') as string | null;
		const endDate = formData.get('end') as string | null;

		let startTimeInTimezone: Date | null = null;
		let endTimeInTimezone: Date | null = null;
		if (startDate) {
			startTimeInTimezone = dayjs.tz(startDate, timezone).toDate();
		}
		if (endDate) {
			endTimeInTimezone = dayjs.tz(endDate, timezone).toDate();
		}
		if (!startTimeInTimezone && !endTimeInTimezone) {
			return 'ERROR: Either start or end date must be provided.';
		}

		await trpc(locals.auth).events.update({
			id: Number(formData.get('id') as string),
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: startTimeInTimezone,
			end: endTimeInTimezone,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
		return 'Saved event!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).events.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
