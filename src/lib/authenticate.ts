import type { Role } from '.prisma/client';
import { redirect } from '@sveltejs/kit';
import type { AuthRequest, UserSchema } from 'lucia';

/**
 * Authenticates and authorizes a user, redirecting to the login page if
 * they are not logged in or are not one of the specified roles. Returns
 * the user object if successful.
 *
 * NOTE: This is intended for use in Svelte/SvelteKit files like
 * +page.server.ts, not in TRPC routes. Use `authenticate` from
 * src/lib/trpc/middleware instead.
 */
export async function authenticate(auth: AuthRequest, roles?: Role[]): Promise<UserSchema> {
	const session = await auth.validate();
	if (session === null) {
		throw redirect(303, '/?unauthenticated');
	}
	const user = session.user;
	if (roles !== undefined && !hasAnyRole(user.roles, roles)) {
		throw redirect(303, '/?forbidden');
	}
	if (user.status === 'CREATED') {
		throw redirect(303, '/unverified');
	}
	return user;
}

function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
	return userRoles.some((userRole) => allowedRoles.includes(userRole));
}
