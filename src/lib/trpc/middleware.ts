import { hash } from '$lib/hash';
import prisma from './db';
import { t } from './t';

export const authenticate = t.middleware(async ({ ctx, next }) => {
	return next({
		ctx: {
			user: await prisma.user.findUniqueOrThrow({
				where: {
					magicLink: await hash(ctx.magicLink),
				},
			}),
		},
	});
});
