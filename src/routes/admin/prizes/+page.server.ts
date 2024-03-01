import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
};

export const actions = {
	create: async ({ locals, request }) => {
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

	deleteAll: async ({ locals }) => {
		await trpc(locals.auth).events.deleteAll();
	},
};
