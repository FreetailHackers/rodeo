import type { Role } from '@prisma/client';
import { t } from './t';

/**
 * A helper function that returns a TRPC middleware that authenticates a
 * user and enforces that they have one of the specified role(s). If no
 * roles are specified, then all authenticated users are allowed.
 */
export function authenticate(roles?: Role[]) {
	return t.middleware(async ({ ctx, next }) => {
		const session = await ctx.validate();
		if (session === null) {
			throw new Error('Unauthorized');
		}
		if (roles !== undefined && !hasAnyRole(session.user.roles, roles)) {
			throw new Error('Forbidden');
		}
		return next({
			ctx: { user: session.user },
		});
	});
}

function hasAnyRole(userRoles: Role[], allowedRoles: Role[]): boolean {
	return userRoles.some((userRole) => allowedRoles.includes(userRole));
}
