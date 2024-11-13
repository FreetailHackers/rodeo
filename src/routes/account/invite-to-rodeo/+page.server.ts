// import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
	console.log(url);
	const token = url.searchParams.get('token');

	if (!token) {
		throw new Error('Invalid link');
	}

	return {
		token: token,
	};
};

export const actions = {
	createAccount: async ({ locals, request, url }) => {
		const formData = await request.formData();

		try {
			const session = await trpc(locals.auth).users.createAccount({
				token: formData.get('token') as string,
				password: formData.get('password') as string,
			});

			// Add logging to track session creation
			console.log('Session created:', session);

			// Add error handling for session setting
			if (!session) {
				throw new Error('Failed to create session');
			}

			locals.auth.setSession(session);

			// Return success response
			return { success: true };
		} catch (e) {
			console.error('Account creation error:', e);
			throw redirect(302, url.pathname + '?invalid');
		}
	},
};
