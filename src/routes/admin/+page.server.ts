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
		const acceptanceTemplate = formData.get('acceptanceTemplate') as string;
		await trpc(cookies).setSettings({ acceptanceTemplate: acceptanceTemplate });
		return 'Saved!';
	},

	release: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).releaseDecisions(ids);
		return 'Released!';
	},

	remove: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).removeDecisions(ids);
		return 'Removed!';
	},

	releaseAll: async ({ cookies }) => {
		await trpc(cookies).releaseAllDecisions();
		return 'Released!';
	},
};
