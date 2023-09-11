import { googleAuth, githubAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	return {
		user: (await locals.auth.validate())?.user,
		announcements: await trpc(locals.auth).announcements.getAll(),
		settings: await trpc(locals.auth).settings.getPublic(),
		// Check whether various OAuth providers are set up in
		// environment variables so we can show/hide buttons.
		providers: {
			google: googleAuth !== null,
			github: githubAuth !== null,
		},
	};
};

export const actions = {
	login: async ({ locals, request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		try {
			locals.auth.setSession(await trpc(locals.auth).users.login({ email, password }));
		} catch (error) {
			return 'Invalid email or password.';
		}
	},

	logout: async ({ locals }) => {
		await trpc(locals.auth).users.logout();
		locals.auth.setSession(null);
	},

	announce: async ({ locals, request }) => {
		const formData = await request.formData();
		const body = formData.get('announcement') as string;
		await trpc(locals.auth).announcements.create(body);
	},

	unannounce: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		await trpc(locals.auth).announcements.delete(Number(id));
	},
};
