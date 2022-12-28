import { trpc } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = await trpc().getUser(cookies.get('magicLink'));
	return { authenticated: user !== null && Object.keys(user).length > 0 };
}) satisfies LayoutServerLoad;
