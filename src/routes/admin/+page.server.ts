import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return trpc(cookies).getSettings();
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		await trpc(cookies).setSettings({ applicationOpen });
		return 'Updated!';
	},
};
