import type { Role } from '@prisma/client';
import { t } from './t';
import { validateSessionToken } from '$lib/authenticate';

/**
 * A helper function that returns a TRPC middleware that authenticates a
 * user and enforces that they have one of the specified role(s). If no
 * roles are specified, then all authenticated users are allowed.
 */
export function authenticate(roles?: Role[]) {
	return t.middleware(async ({ ctx, next }) => {
		const sessionId = await ctx.cookies.get('session');

		if (sessionId === null || sessionId === undefined) {
			throw new Error('Unauthorized');
		}

		const { session, user } = await validateSessionToken(sessionId);
		if (session === null || user === null) {
			throw new Error('Unauthorized');
		}

		if (roles !== undefined && !hasAnyRole(user?.roles, roles)) {
			throw new Error('Forbidden');
		}
		return next({
			ctx: { user: user },
		});
	});
}

function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
	return userRoles.some((userRole) => allowedRoles.includes(userRole));
}
