import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const magicLink = cookies.get('magicLink');
	return {
		user: trpc().getUser(magicLink),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ request }) => {
		const email = (await request.formData()).get('email');
		if (typeof email !== 'string') {
			return 'Please enter a valid email address.';
		}
		return trpc().generateMagicLink(email);
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},
};
