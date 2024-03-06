import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).infoBox.create({
			title: formData.get('category') as string,
			response: formData.get('challenge') as string,
			category: 'CHALLENGE',
		});
		return 'Created challenge!';
	},

	deleteAll: async ({ locals }) => {
		await trpc(locals.auth).infoBox.deleteAllOfCategory('CHALLENGE');
		return 'Deleted all challenges!';
	},
};
