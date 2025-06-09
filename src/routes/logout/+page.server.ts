import { trpc } from '$lib/trpc/router';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/authenticate';

export const actions = {
	default: async (event) => {
		await trpc(event).users.logout();

		// Invalidate the session in the database
		if (!event.locals.session) {
			return fail(401);
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		// Properly return the redirect
		return redirect(303, '/login');
	},
};
