import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	return {
		user: await trpc(cookies).getUser(),
		info: (await trpc(cookies).getPublicSettings()).info,
	};
};

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const info = formData.get('info') as string;
		await trpc(cookies).setSettings({ info });
	},
};
