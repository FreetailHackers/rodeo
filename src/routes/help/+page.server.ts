import authenticate from '$lib/authenticate';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies);
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies }) => {
		authenticate(cookies);
		return 'Requested!';
	},
};
