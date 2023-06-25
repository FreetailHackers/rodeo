import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const actions = {
	email: async ({ locals, request, url }) => {
		const email = (await request.formData()).get('email') as string;
		await trpc(locals.auth).users.sendPasswordResetEmail({ email });
		throw redirect(302, url.pathname + '?submitted');
	},

	reset: async ({ request, url, locals }) => {
		const formData = await request.formData();
		try {
			const session = await trpc(locals.auth).users.resetPassword({
				token: formData.get('token') as string,
				password: formData.get('password') as string,
			});
			locals.auth.setSession(session);
		} catch (e) {
			throw redirect(302, url.pathname + '?invalid');
		}
		throw redirect(302, '/');
	},
};
