import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).faq.create({
			question: formData.get('question') as string,
			answer: formData.get('answer') as string,
		});
		return 'Created event!';
	},

	deleteAll: async ({ locals }) => {
		await trpc(locals.auth).faq.deleteAll();
	},
};
