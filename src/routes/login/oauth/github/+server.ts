import { createGitHubClient } from '$lib/github';
import { generateState } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

const PRIMARY_DOMAIN = 'rodeo.freetailhackers.com';

export const GET = async (event: RequestEvent) => {
	const hostname = event.url.hostname;
	const github = createGitHubClient();

	if (hostname !== PRIMARY_DOMAIN) {
		event.cookies.set('github_oauth_origin', hostname, {
			path: '/',
			httpOnly: true,
			sameSite: import.meta.env.PROD ? 'none' : 'lax',
			maxAge: 60 * 10,
			secure: import.meta.env.PROD,
		});

		return new Response(null, {
			status: 302,
			headers: {
				Location: `https://${PRIMARY_DOMAIN}/login/oauth/github`,
			},
		});
	}

	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user:email']);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: import.meta.env.PROD ? 'none' : 'lax',
		maxAge: 60 * 10,
		secure: import.meta.env.PROD,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
};
