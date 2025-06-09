import { trpc } from '$lib/trpc/router';
import { setSessionTokenCookie } from '$lib/authenticate';

export const actions = {
	email: async (event) => {
		const email = (await event.request.formData()).get('email') as string;
		await trpc(event).users.sendPasswordResetEmail({ email });
		return new Response(null, {
			status: 302,
			headers: { location: event.url.pathname + '?submitted' },
		});
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
			return new Response(null, {
				status: 302,
				headers: { location: event.url.pathname + '?invalid' },
			});
		}
		return new Response(null, {
			status: 302,
			headers: { location: '/' },
		});
	},
};
