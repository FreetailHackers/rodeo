import { trpc } from '$lib/trpc/router';
import { authenticate } from '$lib/authenticate';

export const load = async ({ locals }) => {
	return {
		name: await trpc(locals.auth).users.getName(),
		email: (await authenticate(locals.auth))?.email,
	};
};

export const actions = {
	updateName: async ({ locals, request }) => {
		const name = (await request.formData()).get('name') as string;
		await trpc(locals.auth).users.updateName(name);
	},
};
