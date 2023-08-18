import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		decisions: await trpc(locals.auth).admissions.getDecisions(),
		settings: await trpc(locals.auth).settings.getAll(),
	};
};

export const actions = {
	release: async ({ locals }) => {
		await trpc(locals.auth).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},
};
