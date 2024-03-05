import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals }) => {
		await trpc(locals.auth).users.logout();
		locals.auth.setSession(null);
		throw redirect(303, '/');
	},
};
