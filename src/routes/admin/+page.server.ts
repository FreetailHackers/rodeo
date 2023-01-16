import authenticate from '$lib/authenticate';
import { Role } from '@prisma/client';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = await authenticate(cookies);
	if (user.role !== Role.ADMIN) {
		throw error(403, 'Forbidden');
	}
}) satisfies PageServerLoad;
