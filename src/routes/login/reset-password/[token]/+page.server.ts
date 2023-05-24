import { resetPasswordToken } from '$lib/lucia';
import { trpc } from '$lib/trpc/router.js';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }) => {
	try {
		const token = await resetPasswordToken.validate(params.token);
		// Checking a token invalidates it, so must issue a new one
		return { token: (await resetPasswordToken.issue(token.userId)).toString() };
	} catch (e) {
		return { token: null };
	}
};

export const actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		try {
			const session = await trpc(locals.auth).users.resetPassword({
				token: formData.get('token') as string,
				password: formData.get('password') as string,
			});
			locals.auth.setSession(session);
		} catch (e) {
			throw redirect(302, request.url);
		}
		throw redirect(302, '/');
	},
};
