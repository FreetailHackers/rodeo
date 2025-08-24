import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const session = await locals.session;
	if (session === null || locals.user.status !== 'CREATED' || locals.user.verifiedEmail) {
		redirect(303, '/');
	}
};

export const actions = {
	default: async (event) => {
		await trpc(event).users.sendVerificationEmail();
		return 'Verification email resent!';
	},
};
