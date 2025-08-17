import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	try {
		await trpc(event).users.verifyEmail(event.params.token);
		return { success: true };
	} catch (e) {
		return { success: false };
	}
};
