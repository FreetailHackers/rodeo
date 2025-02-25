import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ORGANIZER', 'ADMIN']);
	return {
		groups: await trpc(locals.auth).users.getAllGroups(),
	};
};
