import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { createGoogleClient } from '$lib/google';
import { trpc } from '$lib/trpc/router';
import { decodeIdToken } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const baseUrl = `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/google/callback`;

	const google = createGoogleClient(redirectUri);

	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;

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
		return new Response(null, {
			status: 400,
		});
	}

	const claims = decodeIdToken(tokens.idToken()) as any;
	const googleUserId = claims.sub as string;
	const username = (claims.name as string) || '';
	let googleEmail = (claims.email as string) || '';

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

	const registrationResult = await trpc(event).users.registerGoogle({
		id: googleUserId,
		username: username,
		email: googleEmail,
	});

	if (!registrationResult) {
		console.error('Registration failed - no session returned');
		return new Response('Registration failed', { status: 500 });
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
