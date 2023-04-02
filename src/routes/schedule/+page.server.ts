import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const daysOfWeek: Array<string> = [];
function getDayMonthString(date: Date) {
	return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export const load = async ({ cookies }) => {
	const eventList = await trpc(cookies).events.getAll();
	for (const day of eventList) {
		const hackathonDate = getDayMonthString(day.start);
		if (!daysOfWeek.includes(hackathonDate)) {
			daysOfWeek.push(hackathonDate);
		}
	}
	return {
		schedule: eventList,
		user: await trpc(cookies).users.get(),
		daysOfWeek: daysOfWeek,
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
			throw new Error('Invalid announcement ID.');
		}
		return await trpc(cookies).events.get(Number(id));
	},

	saveEdit: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid announcement ID.');
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
			throw new Error('Invalid announcement ID.');
		}
		await trpc(cookies).events.delete(Number(id));
	},
};
