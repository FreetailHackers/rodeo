import { generateState, generateCodeVerifier } from 'arctic';
import { createGoogleClient } from '$lib/google';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	// Use current hostname to create redirect URI
	const baseUrl = `${event.url.protocol}//${event.url.hostname}${event.url.port ? ':' + event.url.port : ''}`;
	const redirectUri = `${baseUrl}/login/oauth/google/callback`;

	// Create Google client with current hostname
	const google = createGoogleClient(redirectUri);

	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

	const isProduction = process.env.NODE_ENV === 'production' || event.url.hostname !== 'localhost';

	console.log('Setting OAuth cookies:', {
		hostname: event.url.hostname,
		protocol: event.url.protocol,
		baseUrl,
		redirectUri,
		isProduction,
		secure: isProduction,
	});

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
		secure: isProduction, // Must be secure when sameSite is 'none'
	});
	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in production
		secure: isProduction, // Must be secure when sameSite is 'none'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString(),
		},
	});
}
