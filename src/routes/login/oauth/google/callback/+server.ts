import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { createGoogleClient } from '$lib/google';
import { trpc } from '$lib/trpc/router';
import { decodeIdToken } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	// Use current hostname to create redirect URI (must match the initiation)
	const baseUrl = `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/google/callback`;

	// Create Google client with current hostname
	const google = createGoogleClient(redirectUri);

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;

	// Debug logging for production
	console.log('OAuth callback debug:', {
		hasCode: !!code,
		hasState: !!state,
		hasStoredState: !!storedState,
		hasCodeVerifier: !!codeVerifier,
		stateMatch: state === storedState,
	});

	if (code === null || state === null || storedState === null || codeVerifier === null) {
		console.error('Missing OAuth parameters:', {
			code: !!code,
			state: !!state,
			storedState: !!storedState,
			codeVerifier: !!codeVerifier,
		});
		return new Response(
			JSON.stringify({
				error: 'Missing OAuth parameters',
				details: {
					code: !!code,
					state: !!state,
					storedState: !!storedState,
					codeVerifier: !!codeVerifier,
				},
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
	if (state !== storedState) {
		console.error('State mismatch:', { received: state, stored: storedState });
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
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		console.error('Token validation error:', e);
		// Invalid code or client credentials
		return new Response(
			JSON.stringify({
				error: 'Token validation failed',
				details: e instanceof Error ? e.message : 'Unknown error',
			}),
			{
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}

	const claims = decodeIdToken(tokens.idToken()) as any;
	const googleUserId = claims.sub as string;
	const username = (claims.name as string) || '';
	let googleEmail = (claims.email as string) || '';

	// If email is not in the ID token, fetch it from Google's userinfo API
	// TODO: Clean
	if (!googleEmail) {
		try {
			const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`,
				},
			});
			const userinfo = await userinfoResponse.json();
			googleEmail = userinfo.email || '';
		} catch (e) {
			throw e;
		}
	}

	const existingUser = await trpc(event).users.getUserFromGoogleId(googleUserId);

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

	await trpc(event).users.registerGoogle({
		id: googleUserId,
		username: username,
		email: googleEmail,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
