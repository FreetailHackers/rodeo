import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';
import { Role } from '@prisma/client';

export const load = (async ({ cookies }) => {
	const user = await authenticate(cookies, Role.HACKER);
	return {
		user,
		applicationOpen: trpc(cookies).getApplicationOpen(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	save: async ({ cookies, request }) => {
		await trpc(cookies).setUser(Object.fromEntries(await request.formData()));
		return 'Saved!';
	},

	finish: async ({ cookies, request }) => {
		await trpc(cookies).setUser(Object.fromEntries(await request.formData()));
		return await trpc(cookies).submitApplication();
	},

	withdraw: async ({ cookies }) => {
		return await trpc(cookies).setUser({});
	},
};
