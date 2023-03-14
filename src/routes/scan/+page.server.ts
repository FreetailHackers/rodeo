import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ORGANIZER, Role.ADMIN]);
};

export const actions: Actions = {
	scan: async ({ cookies, request }) => {
		const formData = await request.formData();
		const magicLink = formData.get('magicLink') as string;
		const action = formData.get('action') as string;
		await trpc(cookies).scanUser({ magicLink, action });
	},
};
