export const load = async ({ locals, url }) => {
	const { pathname } = url;
	
	return {
		user: (await locals.auth.validateUser()).user,
		pathname: pathname
	};
}