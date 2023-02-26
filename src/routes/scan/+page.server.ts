import authenticate from '$lib/authenticate';
import { Role } from '@prisma/client';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, [Role.ORGANIZER, Role.ADMIN]);
}) satisfies PageServerLoad;
