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

	console.log('Google OAuth callback:', {
		hostname: event.url.hostname,
		redirectUri,
		hasCode: !!code,
		hasState: !!state,
		hasStoredState: !!storedState,
		hasCodeVerifier: !!codeVerifier,
		stateMatch: state === storedState,
	});
	if (code === null || state === null || storedState === null || codeVerifier === null) {
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
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
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

	console.log('Google OAuth user lookup:', {
		googleUserId,
		existingUserFound: !!existingUser,
		existingUserId: existingUser?.id,
	});

	if (existingUser) {
		console.log('Creating session for existing user:', existingUser.id);
		const sessionToken = await createSession(existingUser.id);
		setSessionTokenCookie(event, sessionToken.id, sessionToken.expiresAt);
		console.log('Session created and cookie set for existing user');
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	console.log('Registering new Google user:', { googleUserId, username, googleEmail });
	const registrationResult = await trpc(event).users.registerGoogle({
		id: googleUserId,
		username: username,
		email: googleEmail,
	});

	console.log('Registration result:', registrationResult);

	// The registerGoogle function should have set the session cookie via TRPC
	// But let's add a fallback just in case
	if (!registrationResult) {
		console.error('Registration failed - no session returned');
		return new Response('Registration failed', { status: 500 });
	}

	console.log('New user registered successfully, redirecting to home');
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
