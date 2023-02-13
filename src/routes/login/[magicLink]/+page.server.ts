import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, cookies }) => {
	cookies.set('magicLink', params.magicLink, { path: '/' });
	await trpc(cookies).verifyUser();
	throw redirect(303, '/');
}) satisfies PageServerLoad;
