import { trpc } from '$lib/trpc/router';

export const actions = {
	email: async ({ locals, request, url }) => {
		const email = (await request.formData()).get('email') as string;
		await trpc(locals.auth).users.sendPasswordResetEmail({ email });
		return new Response(null, {
			status: 302,
			headers: { location: url.pathname + '?submitted' },
		});
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
			return new Response(null, {
				status: 302,
				headers: { location: url.pathname + '?invalid' },
			});
		}
		return new Response(null, {
			status: 302,
			headers: { location: '/' },
		});
	},
};
