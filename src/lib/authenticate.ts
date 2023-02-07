import type { Role, User } from '.prisma/client';
import { error, type Cookies } from '@sveltejs/kit';
import { trpc } from './trpc/router';

/**
 * Authenticates a user. Returns their magic link if successful; throws an error otherwise.
 */
export default async function authenticate(cookies: Cookies, role?: Role): Promise<User> {
	const user = await trpc(cookies).getUser();
	if (user === null) {
		throw error(401, 'Unauthorized');
	}
	if (role !== undefined && user.role !== role) {
		throw error(403, 'Forbidden');
	}
	return user;
}
