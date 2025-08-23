import { trpc } from '$lib/trpc/router';
import { setSessionTokenCookie } from '$lib/authenticate';
import { redirect } from '@sveltejs/kit';

export const actions = {
	email: async (event) => {
		const email = (await event.request.formData()).get('email') as string;
		await trpc(event).users.sendPasswordResetEmail({ email });
		throw redirect(302, event.url.pathname + '?submitted');
	},

	reset: async (event) => {
		const formData = await event.request.formData();
		try {
			const session = await trpc(event).users.resetPassword({
				token: formData.get('token') as string,
				password: formData.get('password') as string,
			});
			setSessionTokenCookie(event, session.id, session.expiresAt);
		} catch (e) {
			throw redirect(302, event.url.pathname + '?invalid');
		}
		throw redirect(302, '/');
	},
};
