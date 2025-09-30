import { github } from '$lib/authenticate';
import { generateState } from 'arctic';
import type { RequestEvent } from './$types';

export const GET = async (event: RequestEvent) => {
	const state = generateState();
	if (github === null) {
		return new Response('GitHub OAuth is not configured.', {
			status: 500,
		});
	}
	const url = github.createAuthorizationURL(state, ['user:email']);

	event.cookies.set('github_oauth_state', state, {
		httpOnly: true,
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
		path: '/',
		sameSite: 'lax',
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
};
