import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	return {
		user: trpc(cookies).getUser(),
		announcements: trpc(cookies).getAnnouncements(),
		applicationOpen: (await trpc(cookies).getPublicSettings()).applicationOpen,
	};
};

export const actions: Actions = {
	login: async ({ cookies, request }) => {
		const email = (await request.formData()).get('email');
		if (typeof email !== 'string') {
			return { success: false, message: 'Please enter a valid email address.' };
		}
		return await trpc(cookies).loginWithEmail(email);
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},

	announce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const body = formData.get('announcement');
		if (typeof body !== 'string') {
			throw new Error('Invalid announcement body.');
		}
		await trpc(cookies).createAnnouncement(body);
		return 'Created announcement!';
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
