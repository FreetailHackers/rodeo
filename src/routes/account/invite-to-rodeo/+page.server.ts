// import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ url }) => {
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
			console.log('started creating account');
			const session = await trpc(locals.auth).users.createAccount({
				token: formData.get('token') as string,
				password: formData.get('password') as string,
			});
			console.log('finished creating account');
			locals.auth.setSession(session);
			console.log('finished creating session');
		} catch (e) {
			throw redirect(302, url.pathname + '?invalid');
		}
	},
};
