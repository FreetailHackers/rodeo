import authenticate from '$lib/authenticate';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return { user: (await authenticate(cookies.get('magicLink'))).user };
}) satisfies PageServerLoad;
