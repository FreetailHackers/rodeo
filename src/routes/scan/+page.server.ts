import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ORGANIZER', 'ADMIN']);
	return {
		scanActions: (await trpc(locals.auth).settings.getPublic()).scanActions,
	};
};
