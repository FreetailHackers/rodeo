import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.faqQuestion))) {
		throw error(404, 'Event not found');
	}
	const question = await trpc(locals.auth).otherCategories.get(Number(params.faqQuestion));
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

		await trpc(locals.auth).otherCategories.update({
			id: Number(formData.get('id') as string),
			title: formData.get('title') as string,
			response: formData.get('response') as string,
			category: 'FAQ',
		});
		return 'Saved event!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).otherCategories.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
