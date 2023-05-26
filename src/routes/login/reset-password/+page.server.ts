import { trpc } from '$lib/trpc/router';

export const actions = {
	default: async ({ locals, request }) => {
		const email = (await request.formData()).get('email') as string;
		await trpc(locals.auth).users.sendPasswordResetEmail({ email });
	},
};
