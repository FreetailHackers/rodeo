import authenticate from '$lib/authenticate';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies);
}) satisfies PageServerLoad;
