import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	return {
		user: (await locals.auth.validate())?.user,
		info: (await trpc(locals.auth).settings.getPublic()).info,
	};
};

export const actions = {
	default: async ({ locals, request }) => {
		const formData = await request.formData();
		const info = formData.get('info') as string;
		await trpc(locals.auth).settings.update({ info });
		return 'Saved info page!';
	},
};
