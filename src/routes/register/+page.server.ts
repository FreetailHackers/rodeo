import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/authenticate';

export const load = async (event) => {
	if (event.locals.session !== null) {
		if (await auth.validateSessionToken(event.locals.session.id)) {
			redirect(303, '/');
		}
	}
	return {
		providers: {
			google: auth.google !== null,
			github: auth.github !== null,
		},
	};
};

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const session = await trpc(event).users.register({ email, password });
		if (session !== null) {
			auth.setSessionTokenCookie(event, session.id, session.expiresAt);
			await trpc(event).users.sendVerificationEmail();
		} else {
			return 'That email is already in use, either through a previous registration or linked social (Google/GitHub/...) account.';
		}
	},
};
