import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	return {
		user: (await locals.auth.validate())?.user,
		homepageUrl: (await trpc(locals.auth).settings.getPublic()).homepageURL,
	};
};
