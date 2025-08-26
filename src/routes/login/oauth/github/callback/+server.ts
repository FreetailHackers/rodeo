import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { createGitHubClient } from '$lib/github';
import { trpc } from '$lib/trpc/router';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	// Use current hostname to create redirect URI (must match the initiation)
	const baseUrl = `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/github/callback`;

	// Create GitHub client with current hostname
	const github = createGitHubClient(redirectUri);

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;

	console.log('GitHub OAuth callback debug:', {
		hasCode: !!code,
		hasState: !!state,
		hasStoredState: !!storedState,
		stateMatch: state === storedState,
		redirectUri,
	});

	if (code === null || state === null || storedState === null) {
		console.error('Missing GitHub OAuth parameters:', {
			code: !!code,
			state: !!state,
			storedState: !!storedState,
		});
		return new Response(
			JSON.stringify({
				error: 'Missing GitHub OAuth parameters',
				details: {
					code: !!code,
					state: !!state,
					storedState: !!storedState,
				},
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
	if (state !== storedState) {
		console.error('GitHub state mismatch:', { received: state, stored: storedState });
		return new Response(
			JSON.stringify({
				error: 'State mismatch',
				details: { received: state, stored: storedState },
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		console.error('GitHub token validation error:', e);
		// Invalid code or client credentials
		return new Response(
			JSON.stringify({
				error: 'GitHub token validation failed',
				details: e instanceof Error ? e.message : 'Unknown error',
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
	const githubUserResponse = await fetch('https://api.github.com/user', {
		headers: {
			Authorization: `Bearer ${tokens.accessToken()}`,
		},
	});
	const githubUser = await githubUserResponse.json();
	const githubUserId = githubUser.id;
	const githubUsername = githubUser.login;
	const githubEmail = githubUser.email || ''; // GitHub email might be null if private

	const existingUser = await trpc(event).users.getUserFromGitHubId(githubUserId);

	if (existingUser) {
		const sessionToken = await createSession(existingUser.id);
		setSessionTokenCookie(event, sessionToken.id, sessionToken.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	await trpc(event).users.registerGitHub({
		id: githubUserId,
		username: githubUsername,
		email: githubEmail,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
