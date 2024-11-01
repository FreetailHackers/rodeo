// import { trpc } from '$lib/trpc/router';
import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals, url }) => {
	await authenticate(locals.auth);
	console.log(url);

	const token = url.searchParams.get('token');
	// const token = formData.get('token') as string;

	if (!token) {
		throw new Error('Invalid link');
	}

	return {
		token: token,
	};
};

export const actions = {
	createAccount: async ({ locals, request, url }) => {
		console.log('we even in here?');
		const formData = await request.formData();

		try {
			const session = await trpc(locals.auth).users.createAccount({
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
