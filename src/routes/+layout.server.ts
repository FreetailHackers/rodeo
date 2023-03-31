import { trpc } from '$lib/trpc/router';
/** @type {import('@sveltejs/adapter-vercel').Config} */

export const config = {
	runtime: 'edge',
};

export const load = async ({ cookies }) => {
	return { user: await trpc(cookies).users.get() };
};
