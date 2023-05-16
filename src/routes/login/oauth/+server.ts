import { githubAuth } from '$lib/lucia';

export const GET = async ({ cookies }) => {
	if (githubAuth === null) {
		return new Response(null, { status: 404 });
	}
	const [url, state] = await githubAuth.getAuthorizationUrl();
	cookies.set('github_oauth_state', state, { path: '/', maxAge: 60 });
	return new Response(null, {
		status: 302,
		headers: { location: url.toString() },
	});
};
