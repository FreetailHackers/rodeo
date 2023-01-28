import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const magicLink = cookies.get('magicLink');
	return {
		user: trpc().getUser(magicLink),
		announcements: trpc().getAnnouncements(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	login: async ({ request }) => {
		const email = (await request.formData()).get('email');
		if (typeof email !== 'string') {
			return 'Please enter a valid email address.';
		}
		return trpc().createUser(email);
	},

	logout: ({ cookies }) => {
		cookies.delete('magicLink');
	},

	announce: async ({ cookies, request }) => {
		const formData = await request.formData();
		const magicLink = cookies.get('magicLink');
		const title = formData.get('announcement-title') as string;
		const body = formData.get('announcement-body') as string;
		if (title.trim() === '' || body.trim() === '' || magicLink === undefined) {
			return 'Please enter a valid title and body.';
		}
		await trpc().createAnnouncement({ magicLink, announcement: { title, body } });
		return 'Created announcement!';
	},
};
