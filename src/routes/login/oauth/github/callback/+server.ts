import { createSession, setSessionTokenCookie } from '$lib/authenticate';
import { ObjectParser } from '@pilcrowjs/object-parser';
import { github } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

import type { RequestEvent } from './$types';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const hostname = event.url.hostname;

	const storedState = event.cookies.get('github_oauth_state') ?? null;
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const originalHostname = event.cookies.get('github_oauth_origin') ?? null;

	if (code === null || state === null || storedState === null) {
		return new Response('Please restart the process.', {
			status: 400,
		});
	}
	if (state !== storedState) {
		return new Response('Please restart the process.', {
			status: 400,
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await github.validateAuthorizationCode(code);
	} catch (e) {
		return new Response("Couldn't give Authorization token.", {
			status: 400,
		});
	}

	const githubAccessToken = tokens.accessToken();

	const userRequest = new Request('https://api.github.com/user');
	userRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const userResponse = await fetch(userRequest);
	const userResult: unknown = await userResponse.json();
	const userParser = new ObjectParser(userResult);

	const githubUserId = userParser.getNumber('id');
	const username = userParser.getString('login');

	const existingUser = await trpc(event).users.getUserFromGitHubId(githubUserId);

	const redirectDomain = originalHostname || hostname;
	const redirectUrl = redirectDomain !== hostname ? `https://${redirectDomain}/` : '/';

	if (existingUser) {
		const sessionToken = await createSession(existingUser.id);
		setSessionTokenCookie(event, sessionToken.id, sessionToken.expiresAt);

		event.cookies.delete('github_oauth_state', { path: '/' });
		event.cookies.delete('github_oauth_origin', { path: '/' });

		return new Response(null, {
			status: 302,
			headers: {
				Location: redirectUrl,
			},
		});
	}

	const emailListRequest = new Request('https://api.github.com/user/emails');
	emailListRequest.headers.set('Authorization', `Bearer ${githubAccessToken}`);
	const emailListResponse = await fetch(emailListRequest);
	const emailListResult: unknown = await emailListResponse.json();
	if (!Array.isArray(emailListResult) || emailListResult.length < 1) {
		return new Response('No email address found.', {
			status: 400,
		});
	}
	let email: string | null = null;
	for (const emailRecord of emailListResult) {
		const emailParser = new ObjectParser(emailRecord);
		const primaryEmail = emailParser.getBoolean('primary');
		const verifiedEmail = emailParser.getBoolean('verified');
		if (primaryEmail && verifiedEmail) {
			email = emailParser.getString('email');
		}
	}
	if (email === null) {
		return new Response('Please verify your GitHub email address.', {
			status: 400,
		});
	}

	await trpc(event).users.registerGitHub({
		id: githubUserId,
		username: username,
		email: email,
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: redirectUrl,
		},
	});
}
