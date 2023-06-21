import { githubAuth, googleAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (await locals.auth.validate()) {
		throw redirect(303, '/');
	}
	return {
		providers: {
			google: googleAuth !== null,
			github: githubAuth !== null,
		},
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const session = await trpc(locals.auth).users.register({ email, password });
		if (session !== null) {
			locals.auth.setSession(session);
			await trpc(locals.auth).users.sendVerificationEmail();
		} else {
			return 'That email is already in use, either through a previous registration or linked social (Google/GitHub/...) account.';
		}
	},
};
