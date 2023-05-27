import { trpc } from '$lib/trpc/router';

export const actions = {
	default: async ({ locals }) => {
		await trpc(locals.auth).users.sendVerificationEmail();
		return 'Verification email resent!';
	},
};
