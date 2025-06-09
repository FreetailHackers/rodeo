import { generateCodeVerifier, generateState } from 'arctic';
import * as auth from '$lib/authenticate';

export const GET = async (event) => {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = auth.googleAuth.createAuthorizationURL(state, codeVerifier, ['openid', 'profile']);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
	});

	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: '/',
		},
	});
};
