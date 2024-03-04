import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).infoBox.create({
			title: formData.get('question') as string,
			response: formData.get('answer') as string,
			category: 'FAQ',
		});
		return 'Created event!';
	},

	deleteAll: async ({ locals }) => {
		await trpc(locals.auth).infoBox.deleteAllOfCategory('FAQ');
		return 'Deleted all questions!';
	},
};
