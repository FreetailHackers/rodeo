import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = await authenticate(cookies);
	if (user.role !== Role.ADMIN) {
		throw error(403, 'Forbidden');
	}
	return { users: trpc().getUsers(cookies.get('magicLink') as string) };
}) satisfies PageServerLoad;
