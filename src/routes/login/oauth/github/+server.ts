import { createGitHubClient } from '$lib/github';
import { generateState } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

const PRIMARY_DOMAIN = 'rodeo.freetailhackers.com';

export const GET = async (event: RequestEvent) => {
	const hostname = event.url.hostname;
	const github = createGitHubClient();

	// If we're not on the primary domain, redirect to primary domain for OAuth
	if (hostname !== PRIMARY_DOMAIN) {
		console.log(`[GitHub OAuth] Redirecting from ${hostname} to primary domain for OAuth`);

		// Store the original hostname to redirect back after OAuth
		event.cookies.set('github_oauth_origin', hostname, {
			path: '/',
			httpOnly: true,
			sameSite: import.meta.env.PROD ? 'none' : 'lax',
			maxAge: 60 * 10, // 10 minutes
			secure: import.meta.env.PROD,
		});

		// Redirect to primary domain for OAuth
		return new Response(null, {
			status: 302,
			headers: {
				Location: `https://${PRIMARY_DOMAIN}/login/oauth/github`,
			},
		});
	}

	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user:email']);

	console.log(`[GitHub OAuth] Creating auth URL for hostname: ${hostname}`);
	console.log(`[GitHub OAuth] Auth URL: ${url.toString()}`);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: import.meta.env.PROD ? 'none' : 'lax',
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
