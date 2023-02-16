import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return {
		settings: await trpc(cookies).getAllSettings(),
		decisions: await trpc(cookies).getDecisions(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	settings: async ({ cookies, request }) => {
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		const timestamp = Date.parse(formData.get('confirmBy') as string);
		const confirmBy = Number.isNaN(timestamp) ? null : new Date(timestamp);
		await trpc(cookies).setSettings({ applicationOpen, confirmBy });
	},

	release: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).releaseDecisions(ids);
	},

	remove: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).removeDecisions(ids);
	},

	releaseAll: async ({ cookies }) => {
		await trpc(cookies).releaseAllDecisions();
	},
};
