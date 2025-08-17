import { trpc } from '$lib/trpc/router';
import * as auth from '$lib/authenticate';

export const load = async (event) => {
	await auth.authenticate(event.locals.session, []);

	return {
		user: await event.locals.user,
		announcements: await trpc(event).announcements.getAll(),
		settings: await trpc(event).settings.getPublic(),
		events: await trpc(event).events.getAll(),
		faq: await trpc(event).faq.getAll(),
		challenges: await trpc(event).challenges.getAll(),
		sponsors: await trpc(event).sponsors.getSponsorsWithImageValues(),
		// Check whether various OAuth providers are set up in
		// environment variables so we can show/hide buttons.
		providers: {
			google: auth.googleAuth !== null,
			github: auth.githubAuth !== null,
		},
		canApply: await trpc(event).admissions.canApply(),
	};
};

export const actions = {
	announce: async (event) => {
		const formData = await event.request.formData();
		const body = formData.get('announcement') as string;
		await trpc(event).announcements.create(body);
	},

	unannounce: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		await trpc(event).announcements.delete(Number(id));
	},

	clearAnnouncements: async (event) => {
		await trpc(event).announcements.deleteAll();
	},
};
