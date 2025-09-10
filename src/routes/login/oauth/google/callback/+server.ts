import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { createGoogleClient } from '$lib/authenticate';
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

	if (storedState === null || codeVerifier === null || code === null || state === null) {
		return new Response('Please restart the process.', {
			status: 400,
		});
	}
	if (storedState !== state) {
		return new Response('Please restart the process.', {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		console.error('Error validating Google authorization code:', e);
		return new Response('Please restart the process.', {
			status: 400,
		});
	}

	const claims = decodeIdToken(tokens.idToken());
	const claimsParser = new ObjectParser(claims);

	const googleId = claimsParser.getString('sub');
	const name = claimsParser.getString('name');
	const email = claimsParser.getString('email');
	const existingUser = await trpc(event).users.getUserFromGoogleId(googleId);
	if (existingUser !== null) {
		const session = await createSession(existingUser.id);
		setSessionTokenCookie(event, session.id, session.expiresAt);
		return new Response(null, {
			status: 302,
			headers: {
				Location: '/',
			},
		});
	}

	await trpc(event).users.registerGoogle({
		id: googleId,
		username: name,
		email: email,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
}
