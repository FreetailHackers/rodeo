import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { google } from '$lib/google';
import { trpc } from '$lib/trpc/router';
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
