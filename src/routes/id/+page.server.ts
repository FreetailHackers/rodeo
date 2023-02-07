import authenticate from '$lib/authenticate';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = authenticate(cookies);
	return { user };
}) satisfies PageServerLoad;
