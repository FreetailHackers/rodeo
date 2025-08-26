import { createGitHubClient } from '$lib/github';
import { generateState } from 'arctic';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = async (event: RequestEvent) => {
	// Use current hostname to create redirect URI
	const baseUrl = `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/github/callback`;

	// Create GitHub client with current hostname
	const github = createGitHubClient(redirectUri);

	const state = generateState();
	const url = github.createAuthorizationURL(state, ['user:email']);

	const isProduction = process.env.NODE_ENV === 'production' || event.url.hostname !== 'localhost';

	console.log('Setting GitHub OAuth cookies:', {
		hostname: event.url.hostname,
		protocol: event.url.protocol,
		baseUrl,
		redirectUri,
		isProduction,
	});

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: isProduction ? 'none' : 'lax',
		maxAge: 60 * 10, // 10 minutes
		secure: isProduction,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
};
