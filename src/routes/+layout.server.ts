import { trpc } from '$lib/trpc/router';

export const load = async ({ cookies }) => {
	return { user: await trpc(cookies).users.get() };
};
