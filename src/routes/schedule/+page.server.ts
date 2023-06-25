import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	const dates: Date[] = [];
	const events = await trpc(locals.auth).events.getAll();
	for (const event of events) {
		const date = event.start;
		if (dates.length == 0 || dates[dates.length - 1].toDateString() != date.toDateString()) {
			dates.push(date);
		}
	}
	return {
		schedule: events,
		user: (await locals.auth.validateUser()).user,
		dates: dates,
	};
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();
		const fixedStartTime = dayjs
			.tz(formData.get('start') as string, formData.get('timezone') as string)
			.toDate();

		const fixedEndTime = dayjs
			.tz(formData.get('end') as string, formData.get('timezone') as string)
			.toDate();

		await trpc(locals.auth).events.create({
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
	},

	edit: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		return await trpc(locals.auth).events.get(Number(id));
	},

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

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		await trpc(locals.auth).events.delete(Number(id));
		// Possibly a HACK: return null to prevent page from scrolling to bottom
		return null;
	},
};
