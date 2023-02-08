import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	return {
		user: trpc(cookies).getUser(),
		announcements: trpc(cookies).getAnnouncements(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ cookies, request }) => {
		const email = (await request.formData()).get('email');
		if (typeof email !== 'string') {
			return { success: false, message: 'Please enter a valid email address.' };
		}
		return await trpc(cookies).createUser(email);
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},

	announce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const body = formData.get('announcement');
		if (typeof body !== 'string' || body.trim() === '') {
			return { success: false, message: 'Please enter a valid announcement.' };
		}
		await trpc(cookies).createAnnouncement(body);
		return { success: true, message: 'Created announcement!' };
	},

	unannounce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid announcement ID.');
		}
		await trpc(cookies).deleteAnnouncement(Number(id));
	},
};
