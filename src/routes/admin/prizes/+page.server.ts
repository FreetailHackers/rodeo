import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).otherCategories.create({
			title: formData.get('category') as string,
			response: formData.get('prize') as string,
			category: 'PRIZE',
		});
		return 'Created event!';
	},

	deleteAll: async ({ locals }) => {
		await trpc(locals.auth).otherCategories.deleteAllOfCategory('PRIZE');
		return 'Deleted all questions!';
	},
};
