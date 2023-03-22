import { trpc } from '$lib/trpc/router';
import type { Options } from '@sveltejs/adapter-vercel';

export const config: Options = {
	edge: true,
};

export const load = async ({ cookies }) => {
	return { user: await trpc(cookies).users.get() };
};
