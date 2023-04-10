import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ical, { ICalEvent } from 'ical-generator';

dayjs.extend(utc);
dayjs.extend(timezone);

const cal = ical({
	name: 'Hackathon Schedule',
});

export const load = async ({ cookies }) => {
	const dates: Date[] = [];
	const events = await trpc(cookies).events.getAll();
	for (const event of events) {
		const date = event.start;
		if (dates.length == 0 || dates[dates.length - 1].toDateString() != date.toDateString()) {
			dates.push(date);
		}

		cal.createEvent({
			start: event.start,
			end: event.end,
			summary: event.name,
			description: event.description,
			location: event.location,
		});
	}
	const calURL = cal.toURL();
	return {
		schedule: events,
		user: await trpc(cookies).users.get(),
		dates: dates,
		calURL: calURL,
	};
};

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		const formData = await request.formData();
		const fixedStartTime = dayjs
			.tz(formData.get('start') as string, formData.get('timezone') as string)
			.toDate();

		const fixedEndTime = dayjs
			.tz(formData.get('end') as string, formData.get('timezone') as string)
			.toDate();

		await trpc(cookies).events.create({
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
	},

	edit: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid event ID.');
		}
		return await trpc(cookies).events.get(Number(id));
	},

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

	delete: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid event ID.');
		}
		await trpc(cookies).events.delete(Number(id));
	},
};
