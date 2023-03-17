import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	return {
		user: trpc(cookies).users.get(),
		announcements: trpc(cookies).announcements.getAll(),
		applicationOpen: (await trpc(cookies).settings.getPublic()).applicationOpen,
	};
};

export const actions: Actions = {
	login: async ({ cookies, request }) => {
		const email = (await request.formData()).get('email');
		if (typeof email !== 'string') {
			return { success: false, message: 'Please enter a valid email address.' };
		}
		return await trpc(cookies).users.register(email);
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
		await trpc(cookies).announcements.create(body);
	},

	unannounce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		if (typeof id !== 'string') {
			throw new Error('Invalid announcement ID.');
		}
		await trpc(cookies).announcements.delete(Number(id));
	},
};
