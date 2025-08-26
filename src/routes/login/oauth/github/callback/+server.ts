import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { github } from '$lib/github';
import { trpc } from '$lib/trpc/router';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (code === null || state === null || storedState === null) {
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
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
