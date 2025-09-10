import { createGitHubClient } from '$lib/authenticate';
import { generateState } from 'arctic';

import type { RequestEvent } from './$types';

const PRIMARY_DOMAIN = 'https://rodeo.freetailhackers.com';

export function GET(event: RequestEvent): Response {
	const baseUrl = import.meta.env.PROD
		? PRIMARY_DOMAIN
		: `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/github/callback`;

	const github = createGitHubClient(redirectUri);
	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user:email']);

	if (import.meta.env.PROD) {
		event.cookies.set('github_oauth_origin', event.url.hostname, {
			path: '/',
			httpOnly: true,
			sameSite: 'none',
			maxAge: 60 * 10,
			secure: true,
		});
	}

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
}
