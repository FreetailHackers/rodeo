import { auth, githubAuth } from '$lib/lucia';
import { redirect } from '@sveltejs/kit';
import { _upsert } from '../+server.js';

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
	if (code === null || url.searchParams.get('state') !== cookies.get('state')) {
		throw redirect(302, '/');
	}

	try {
		const providerUserAuth = await githubAuth.validateCallback(code);

		// Get primary email (which should be verified) from GitHub API
		const res = await fetch('https://api.github.com/user/emails', {
			headers: { Authorization: `Bearer ${providerUserAuth.githubTokens.accessToken}` },
		});
		const emails: GitHubEmailResponse[] = await res.json();
		const email = emails.find((e) => e.primary);

		// GitHub docs says OAuth is only enabled when the user has
		// verified their email, but we'll check anyway
		if (email === undefined || !email.verified) {
			throw redirect(302, '/');
		}

		const id = await _upsert(providerUserAuth, email.email);
		const session = await auth.createSession({ userId: id, attributes: {} });
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
	}
	throw redirect(302, '/');
};
