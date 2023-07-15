import type { Role } from '@prisma/client';
import { t } from './t';

/**
 * A helper function that returns a TRPC middleware that authenticates a
 * user and enforces that they have one of the specified role(s). If no
 * roles are specified, then all authenticated users are allowed.
 */
export function authenticate(roles?: Role[]) {
	return t.middleware(async ({ ctx, next }) => {
		const { user } = await ctx.validateUser();
		if (user === null) {
			throw new Error('Unauthorized');
		}
		if (roles !== undefined && !hasAllRoles(user.role, roles)) {
			throw new Error('Forbidden');
		}
		return next({
			ctx: { user },
		});
	});
}

function hasAllRoles(userRoles: Role[], allowedRoles: Role[]): boolean {
	return userRoles.every((userRole) => allowedRoles.includes(userRole));
}
