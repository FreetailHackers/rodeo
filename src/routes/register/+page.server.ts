import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (await locals.auth.validate()) {
		throw redirect(303, '/');
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		if (password.length < 8) {
			return 'Password must be at least 8 characters long.';
		}
		const session = await trpc(locals.auth).users.register({ email, password });
		if (session !== null) {
			locals.auth.setSession(session);
		} else {
			return 'That email is already in use, either through a previous registration or linked social (Google/GitHub/...) account.';
		}
	},
};
