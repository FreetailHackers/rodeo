import authenticate from '$lib/authenticate';

export const load = async ({ cookies }) => {
	return { user: await authenticate(cookies) };
};
