import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ locals }) => {
	await trpc(locals.auth).users.logout();
	locals.auth.setSession(null);
	throw redirect(303, '/');
};
