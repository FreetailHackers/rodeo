import { error } from '@sveltejs/kit';
import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return { user: await authenticate(cookies) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const magicLink = cookies.get('magicLink');
		if (magicLink === undefined) {
			throw error(401, 'Unauthorized');
		}
		await trpc().setUser({
			magicLink,
			data: Object.fromEntries(await request.formData()),
		});
		return 'Updated!';
	},
};
