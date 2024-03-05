import { githubAuth, googleAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (await locals.auth.validate()) {
		throw redirect(303, '/');
	}
	return {
		user: (await locals.auth.validate())?.user,
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
			console.log('Invalid email or password.');
		}
	},
};
