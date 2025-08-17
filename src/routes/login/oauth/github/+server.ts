import { githubAuth } from '$lib/authenticate';
import { generateState } from 'arctic';

interface GitHubEmailResponse {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string;
}

export const GET = async (event) => {
	const state = generateState();
	const url = githubAuth.createAuthorizationURL(state, []);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
};
