export const load = async ({ locals }) => {
	return {
		user: (await locals.auth.validate())?.user,
	};
};
