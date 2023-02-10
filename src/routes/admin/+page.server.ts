import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return {
		settings: await trpc(cookies).getSettings(),
		decisions: await trpc(cookies).getDecisions(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	settings: async ({ cookies, request }) => {
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		await trpc(cookies).setSettings({ applicationOpen });
		return 'Saved!';
	},

	release: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).releaseDecisions(ids);
		return 'Released!';
	},

	releaseAll: async ({ cookies }) => {
		await trpc(cookies).releaseAllDecisions();
		return 'Released!';
	},
};
