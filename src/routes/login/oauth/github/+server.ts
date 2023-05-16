import { auth, githubAuth } from '$lib/lucia';
import { prisma } from '$lib/trpc/db';
import { redirect } from '@sveltejs/kit';

interface GitHubEmailResponse {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string;
}

export const GET = async ({ cookies, url, locals }) => {
	if (githubAuth === null) {
		return new Response(null, { status: 404 });
	}
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	// Verify that the state is the same as the one we stored and
	// generated before redirecting to the GitHub consent screen to
	// prevent CSRF attacks.
	const storedState = cookies.get('github_oauth_state');
	if (code === null || state !== storedState) {
		throw redirect(302, '/');
	}

	try {
		const providerSession = await githubAuth.validateCallback(code);
		// Get primary email (which should be verified) from GitHub API
		const res = await fetch('https://api.github.com/user/emails', {
			headers: { Authorization: `Bearer ${providerSession.tokens.accessToken}` },
		});
		const emails: GitHubEmailResponse[] = await res.json();
		const email = emails.find((e) => e.primary);
		if (email === undefined || !email.verified) {
			throw redirect(302, '/');
		}

		let user = await prisma.authUser.findUnique({
			where: { email: email.email },
		});
		// If no user has registered with this email, create a new user
		if (user === null) {
			user = await providerSession.createUser({
				email: email.email,
				role: 'HACKER',
				status: 'CREATED',
			});
		} else if (providerSession.existingUser === null) {
			// Otherwise, link the accounts
			await providerSession.createPersistentKey(user.id);
		}
		const session = await auth.createSession(user.id);
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
	}
	throw redirect(302, '/');
};
