import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { createGitHubClient } from '$lib/github';
import { trpc } from '$lib/trpc/router';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const hostname = event.url.hostname;
	const github = createGitHubClient();

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	const originalHostname = event.cookies.get('github_oauth_origin') ?? null;

	console.log(`[GitHub OAuth Callback] Hostname: ${hostname}`);
	console.log(`[GitHub OAuth Callback] Original hostname: ${originalHostname}`);
	console.log(`[GitHub OAuth Callback] Code: ${code ? 'present' : 'missing'}`);
	console.log(`[GitHub OAuth Callback] State: ${state ? 'present' : 'missing'}`);
	console.log(`[GitHub OAuth Callback] Stored state: ${storedState ? 'present' : 'missing'}`);

	if (code === null || state === null || storedState === null) {
		console.log('[GitHub OAuth Callback] Missing required parameters');
		return new Response(null, {
			status: 400,
		});
	}
	if (state !== storedState) {
		console.log('[GitHub OAuth Callback] State mismatch');
		return new Response(null, {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		console.log('[GitHub OAuth Callback] Validating authorization code...');
		tokens = await github.validateAuthorizationCode(code);
		console.log('[GitHub OAuth Callback] Successfully validated authorization code');
	} catch (e) {
		console.error('[GitHub OAuth Callback] Failed to validate authorization code:', e);
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

	console.log(`[GitHub OAuth Callback] GitHub user ID: ${githubUserId}`);
	console.log(`[GitHub OAuth Callback] GitHub username: ${githubUsername}`);
	console.log(`[GitHub OAuth Callback] GitHub email: ${githubEmail ? 'present' : 'not provided'}`);

	const existingUser = await trpc(event).users.getUserFromGitHubId(githubUserId);

	// Determine where to redirect after successful OAuth
	const redirectDomain = originalHostname || hostname;
	const redirectUrl = redirectDomain !== hostname ? `https://${redirectDomain}/` : '/';

	if (existingUser) {
		console.log('[GitHub OAuth Callback] Found existing user, creating session');
		const sessionToken = await createSession(existingUser.id);
		setSessionTokenCookie(event, sessionToken.id, sessionToken.expiresAt);

		// Clean up OAuth cookies
		event.cookies.delete('github_oauth_state', { path: '/' });
		event.cookies.delete('github_oauth_origin', { path: '/' });

		console.log(`[GitHub OAuth Callback] Redirecting to: ${redirectUrl}`);
		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl,
			},
		});
	}

	console.log('[GitHub OAuth Callback] Creating new user');
	await trpc(event).users.registerGitHub({
		id: githubUserId,
		username: githubUsername,
		email: githubEmail,
	});

	// Clean up OAuth cookies
	event.cookies.delete('github_oauth_state', { path: '/' });
	event.cookies.delete('github_oauth_origin', { path: '/' });

	console.log(`[GitHub OAuth Callback] Redirecting to: ${redirectUrl}`);
	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectUrl,
		},
	});
}
