import type { Role, User } from '.prisma/client';
import { error, type Cookies } from '@sveltejs/kit';
import { trpc } from './trpc/router';

/**
 * Authenticates a user. Returns their magic link if successful; throws an error otherwise.
 */
export default async function authenticate(cookies: Cookies, roles?: Role[]): Promise<User> {
	const user = await trpc(cookies).users.get();
	if (user === null) {
		throw error(401, 'Unauthorized');
	}
	if (roles !== undefined && !roles.includes(user.role)) {
		throw error(403, 'Forbidden');
	}
	return user;
}
