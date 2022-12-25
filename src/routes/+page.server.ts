import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
	const magicLink = event.cookies.get('magicLink');
	return {
		user: trpc().getUser(magicLink),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async (event) => {
		const email = (await event.request.formData()).get('email');
		if (typeof email !== 'string') {
			return 'Please enter a valid email address.';
		}
		return trpc().generateMagicLink(email);
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},
};
