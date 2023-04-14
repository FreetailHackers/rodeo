import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params, cookies }) => {
	// Set the magic link cookie with a 90 day expiry
	// This should cover the longest of registration periods
	cookies.set('magicLink', params.magicLink, { path: '/', maxAge: 60 * 60 * 24 * 90 });
	if ((await trpc(cookies).users.get()) === null) {
		throw redirect(303, '/?magiclink');
	}
	throw redirect(303, '/');
};
