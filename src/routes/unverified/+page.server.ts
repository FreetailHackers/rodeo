import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/authenticate';

export const load = async ({ locals }) => {
	const session = await locals.session;

	if (session === null) {
		redirect(303, '/login');
	}

	if (locals.user.status !== 'CREATED' || locals.user.verifiedEmail) {
		redirect(303, '/');
	}

	if (!locals.user.email || locals.user.email.trim() === '') {
		redirect(303, '/login');
	}

	return {
		email: locals.user.email,
	};
};

export const actions = {
	resend: async (event) => {
		await trpc(event).users.sendVerificationEmail();
		return 'Verification email resent!';
	},

	logout: async (event) => {
		const session = await event.locals.session;
		if (session) {
			await invalidateSession(session.id);
			deleteSessionTokenCookie(event);
		}
		redirect(303, '/login');
	},
};
