import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ORGANIZER', 'ADMIN']);
	return {
		scanActions: (await trpc(event).settings.getPublic()).scanActions,
	};
};
