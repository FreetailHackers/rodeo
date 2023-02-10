import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return { user: await trpc(cookies).getAppliedUser() };
}) satisfies PageServerLoad;
