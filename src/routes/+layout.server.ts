import { trpc } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = await trpc().getUser(cookies.get('magicLink'));
	return { user };
}) satisfies LayoutServerLoad;
