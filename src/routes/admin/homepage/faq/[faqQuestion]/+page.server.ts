import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.faqQuestion))) {
		throw error(404, 'Question not found');
	}
	const question = await trpc(locals.auth).faq.get(Number(params.faqQuestion));
	if (question !== null) {
		return {
			question,
		};
	}
	throw error(404, 'Question not found');
};

export const actions = {
	edit: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).faq.update({
			id: Number(formData.get('id') as string),
			question: formData.get('question') as string,
			answer: formData.get('answer') as string,
		});
		return 'Saved question!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).faq.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
