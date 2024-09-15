import { trpc } from '$lib/trpc/router';
import { redirect } from '@sveltejs/kit';
import { authenticate } from '$lib/authenticate';

export const load = async ({ locals, url }) => {
	await authenticate(locals.auth);
	const token = url.searchParams.get('token');
	const teamId = url.searchParams.get('teamId');

	if (!token || !teamId) {
		throw new Error('Invalid link');
	}

	return {
		token: token,
		teamId: Number(teamId),
	};
};

export const actions = {
	respondInvitation: async ({ request, locals }) => {
		const formData = await request.formData();
		const token = formData.get('token') as string;
		const teamId = parseInt(formData.get('teamId') as string, 10);
		const accept = formData.get('action') === 'accept';

		if (!token || isNaN(teamId)) {
			return { error: 'Invalid request' };
		}

		try {
			if (accept) {
				await trpc(locals.auth).team.acceptInvitation({ token, teamId });
			} else {
				await trpc(locals.auth).team.rejectInvitation({ token, teamId });
			}
			throw redirect(303, '/account');
		} catch (error) {
			return 'Invalid request.';
		}
	},
};
