import { auth, googleAuth } from '$lib/lucia';
import { redirect } from '@sveltejs/kit';
import { _upsert } from '../+server';

export const GET = async ({ cookies, url, locals }) => {
	if (googleAuth === null) {
		return new Response(null, { status: 404 });
	}
	const code = url.searchParams.get('code');
	if (code === null || url.searchParams.get('state') !== cookies.get('state')) {
		throw redirect(302, '/');
	}

	try {
		const providerSession = await googleAuth.validateCallback(code);

		// Google follows the OpenID Connect spec, which means that we
		// can get the user's email from the ID JWT without making any
		// additional API calls :)

		// Google emails should be always verified, but check just in case
		if (!providerSession.providerUser.email_verified) {
			throw redirect(302, '/');
		}

		const id = await _upsert(providerSession, providerSession.providerUser.email);
		const session = await auth.createSession(id);
		locals.auth.setSession(session);
	} catch (e) {
		console.error(e);
	}
	throw redirect(302, '/');
};
