import { trpc } from '$lib/trpc/router';
import type { Options } from '@sveltejs/adapter-vercel';

export const load = async ({ cookies }) => {
	const config: Options = {
		edge: true,
	};
	return { user: await trpc(cookies).users.get(), config: config };
};
