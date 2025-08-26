import { githubAuth } from '$lib/authenticate';
import { generateState } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	const state = generateState();
	const url = githubAuth.createAuthorizationURL(state, ['user:email']);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 10, // 10 minutes
		secure: import.meta.env.PROD,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
};
