import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const magicLink = (await authenticate(cookies.get('magicLink'), Role.ADMIN)).magicLink;
	return trpc().getSettings(magicLink);
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies, request }) => {
		const magicLink = (await authenticate(cookies.get('magicLink'), Role.ADMIN)).magicLink;
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		await trpc().setSettings({ magicLink, settings: { applicationOpen } });
		return 'Updated!';
	},
};
