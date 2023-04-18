import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	return {
		user: await trpc(cookies).users.get(),
		info: (await trpc(cookies).settings.getPublic()).info,
	};
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const info = formData.get('info') as string;
		await trpc(cookies).settings.update({ info });
		return 'Saved info page!';
	},
};
