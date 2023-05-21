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

		const id = await _upsert(providerSession, email.email);
		const session = await auth.createSession(id);
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
	}
	throw redirect(302, '/');
};
