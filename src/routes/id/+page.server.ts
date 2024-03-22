import { authenticate } from '$lib/authenticate';

export const load = async ({ locals }) => {
	return { user: await authenticate(locals.auth) };
};
