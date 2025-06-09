import * as auth from '$lib/authenticate';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (code === null || state === null || storedState === null) {
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
		tokens = await auth.githubAuth.validateAuthorizationCode(code);
	} catch (e) {
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

	const existingUser = await auth.getUserFromGitHubId(githubUserId);

	if (existingUser) {
		const session = await auth.createSession(event.locals.user.id);
		auth.setSessionTokenCookie(event, session.id, session.expiresAt);
		redirect(302, '/');
	}

	const user = await auth.createGitHubUser(githubUserId, githubUsername, githubUsername);
	const session = await auth.createSession(user.id);
	auth.setSessionTokenCookie(event, session.id, session.expiresAt);

	return redirect(302, '/');
}
