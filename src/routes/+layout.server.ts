import { trpc } from '$lib/trpc/router';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return { user: await trpc(cookies).getUser() };
}) satisfies LayoutServerLoad;
