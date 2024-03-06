import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.specificChallenge))) {
		throw error(404, 'Challenge not found');
	}
	const challenge = await trpc(locals.auth).infoBox.get(Number(params.specificChallenge));
	if (challenge !== null) {
		return {
			challenge,
		};
	}
	throw error(404, 'Challenge not found');
};

export const actions = {
	edit: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).infoBox.update({
			id: Number(formData.get('id') as string),
			title: formData.get('title') as string,
			response: formData.get('response') as string,
			category: 'CHALLENGE',
		});
		return 'Saved challenge!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).infoBox.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
