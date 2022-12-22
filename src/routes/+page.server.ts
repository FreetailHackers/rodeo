import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ fetch }) => {
	const user = await fetch('/api/user');
	if (user.status === 401) {
		return { user: null };
	}
	return {
		user: await user.json(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ fetch, request }) => {
		const response = await fetch('/api/user', {
			method: 'POST',
			body: String(await (await request.formData()).get('email')),
		});
		return { status: await response.text() };
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},
};
