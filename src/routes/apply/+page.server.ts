import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const magicLink = cookies.get('magicLink');
	if (magicLink === undefined) {
		throw redirect(303, '/');
	}
	return {
		user: await trpc().getUser(magicLink),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const magicLink = cookies.get('magicLink');
		if (magicLink === undefined) {
			return 'You are not logged in!';
		}
		await trpc().setUser({ magicLink, data: Object.fromEntries(await request.formData()) });
		return 'Updated!';
	},
};
