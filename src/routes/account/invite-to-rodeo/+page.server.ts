// import { trpc } from '$lib/trpc/router';
import { authenticate } from '$lib/authenticate';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	await authenticate(locals.auth);
	const token = url.searchParams.get('token');

	if (!token) {
		throw new Error('Invalid link');
	}

	return {
		token: token,
	};
};

export const actions = {
	createAccount: async ({ url }) => {
		// const formData = await request.formData();
		const token = url.searchParams.get('token');
		if (!token) {
			return { error: 'Invalid request' };
		}
		try {
			// const password = formData.get('password') as string;
		} catch (e) {
			throw redirect(302, url.pathname + '?invalid');
		}
		throw redirect(302, '/');
	},
};
