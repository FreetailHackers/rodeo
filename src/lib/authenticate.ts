import type { Role, User } from '.prisma/client';
import { type Cookies, redirect } from '@sveltejs/kit';
import { trpc } from './trpc/router';

/**
 * Authenticates a user. Returns their magic link if successful; throws
 * an error otherwise.
 *
 * NOTE: This is intended for use in Svelte/SvelteKit files like
 * +page.server.ts, not in TRPC routes. Use `authenticate` from
 * src/lib/trpc/middleware instead.
 */
export default async function authenticate(cookies: Cookies, roles?: Role[]): Promise<User> {
	const user = await trpc(cookies).users.get();
	if (user === null) {
		throw redirect(303, '/?unauthenticated');
	}
	if (roles !== undefined && !roles.includes(user.role)) {
		throw redirect(303, '/?forbidden');
	}
	return user;
}
