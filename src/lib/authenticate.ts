import type { Role, User } from '.prisma/client';
import { error } from '@sveltejs/kit';
import { trpc } from './trpc/router';

/**
 * Authenticates a user. Returns their magic link if successful; throws an error otherwise.
 */
export default async function authenticate(
	magicLink?: string,
	role?: Role
): Promise<{ magicLink: string; user: User }> {
	if (magicLink === undefined) {
		throw error(401, 'Unauthorized');
	}
	const user = await trpc().getUser(magicLink);
	if (user === null) {
		throw error(401, 'Unauthorized');
	}
	if (role !== undefined && user.role !== role) {
		throw error(403, 'Forbidden');
	}
	return { magicLink, user };
}
