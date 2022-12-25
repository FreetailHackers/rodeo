import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async (event) => {
	const magicLink = event.cookies.get('magicLink');
	return {
		user: await router.createCaller(await createContext(event)).getUser(magicLink),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async (event) => {
		const email = (await event.request.formData()).get('email');
		if (typeof email !== 'string') {
			return { status: 'Please enter a valid email address.' };
		}
		const res = await router.createCaller(await createContext(event)).generateMagicLink(email);
		return { status: res };
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},
};
