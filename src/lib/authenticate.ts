import type { Role } from '.prisma/client';
import { redirect } from '@sveltejs/kit';
import type { AuthRequest, UserSchema } from 'lucia-auth';

/**
 * Authenticates a user. Returns their magic link if successful; throws
 * an error otherwise.
 *
 * NOTE: This is intended for use in Svelte/SvelteKit files like
 * +page.server.ts, not in TRPC routes. Use `authenticate` from
 * src/lib/trpc/middleware instead.
 */
export async function authenticate(auth: AuthRequest, roles?: Role[]): Promise<UserSchema> {
	const { user } = await auth.validateUser();
	if (user === null) {
		throw redirect(303, '/?unauthenticated');
	}
	if (roles !== undefined && !roles.includes(user.role)) {
		throw redirect(303, '/?forbidden');
	}
	return user;
}
