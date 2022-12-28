import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return { user: await authenticate(cookies) };
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const user = await authenticate(cookies);
		await trpc().setUser({
			magicLink: user.magicLink,
			data: Object.fromEntries(await request.formData()),
		});
		return 'Updated!';
	},
};
