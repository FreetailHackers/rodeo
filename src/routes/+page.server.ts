import { googleAuth, githubAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	return {
		user: (await locals.auth.validate())?.user,
		announcements: await trpc(locals.auth).announcements.getAll(),
		schedule: await trpc(locals.auth).events.getAll(),
		settings: await trpc(locals.auth).settings.getPublic(),
		faqs: await trpc(locals.auth).infoBox.getAllOfCategory('FAQ'),
		challenges: await trpc(locals.auth).infoBox.getAllOfCategory('CHALLENGE'),

		// Check whether various OAuth providers are set up in
		// environment variables so we can show/hide buttons.
		providers: {
			google: googleAuth !== null,
			github: githubAuth !== null,
		},
		canApply: await trpc(locals.auth).admissions.canApply(),
	};
};

export const actions = {
	announce: async ({ locals, request }) => {
		const formData = await request.formData();
		const body = formData.get('announcement') as string;
		await trpc(locals.auth).announcements.create(body);
	},

	unannounce: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		await trpc(locals.auth).announcements.delete(Number(id));
	},
};
