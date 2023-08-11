import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const { user } = await locals.auth.validateUser();
	if (user == null || user.status !== 'CREATED') {
		throw redirect(303, '/');
	}
};

export const actions = {
	default: async ({ locals }) => {
		await trpc(locals.auth).users.sendVerificationEmail();
		return 'Verification email resent!';
	},
};
