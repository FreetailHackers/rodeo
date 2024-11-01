import { trpc } from '$lib/trpc/router';
// import { authenticate } from '$lib/authenticate';

export const load = async ({ url }) => {
	// await authenticate(locals.auth);
	const token = url.searchParams.get('token');

	if (!token) {
		throw new Error('Invalid link');
	}
	return { token: token };
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
				return await trpc(locals.auth).team.acceptInvitation({ token, teamId });
			} else {
				return await trpc(locals.auth).team.rejectInvitation({ token, teamId });
			}
		} catch (error) {
			return 'Invalid request.';
		}
	},
};
