import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/authenticate';
import { verifyEmailInput } from '$lib/authenticate';
import { trpc } from '$lib/trpc/client';

export const load = async (event) => {
	if (event.locals.user) {
		return redirect(303, '/');
	}

	return {
		user: null,
		providers: {
			google: auth.google !== null,
			github: auth.github !== null,
		},
	};
};

export const actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		if (typeof email !== 'string' || typeof password !== 'string') {
			return 'Invalid or missing fields';
		}

		if (!verifyEmailInput(email)) {
			return 'Invalid email';
		}

		const user = await trpc(event).users.getUserFromEmail.query(email);
		if (!user) {
			return 'User not found.';
		}

		const verifiedUser = await trpc(event).users.login.mutate({ email, password });
		if (!verifiedUser) {
			return 'Invalid password.';
		}

		if (verifiedUser) {
			return redirect(303, '/');
		}
	},
};
