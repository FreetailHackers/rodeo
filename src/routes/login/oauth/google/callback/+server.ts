import * as auth from '$lib/authenticate';
import { decodeIdToken } from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
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
		tokens = await auth.googleAuth.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400,
		});
	}
	const claims = decodeIdToken(tokens.idToken()) as { sub: string; name: string };
	const googleUserId = claims.sub;
	const username = claims.name;

	const existingUser = await auth.getUserFromGoogleId(googleUserId);

	if (existingUser !== null) {
		const session = await auth.createSession(existingUser.id);
		auth.setSessionTokenCookie(event, session.id, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	const user = await auth.createGoogleUser(googleUserId, username, username + '@gmail.com');

	const session = await auth.createSession(user.id);
	auth.setSessionTokenCookie(event, session.id, session.expiresAt);
	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
