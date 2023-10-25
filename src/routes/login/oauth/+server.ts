/**
 * Here is an overview of Rodeo's OAuth architecture:
 *
 * 1. The user clicks the "Sign in with ..." button on the login page.
 * 2. That button links to a route like /login/oauth?provider=... which
 *    corresponds to the GET function below.
 * 3. The GET function selects the correct provider depending on the
 *    provider query parameter and redirects the user to the provider's
 *    consent screen (after setting a cookie with a random state to
 *    prevent CSRF).
 * 4. The user consents to the permissions requested by Rodeo (currently
 *    just their email address) and is redirected back to the
 *    /login/oauth/[provider] route, which corresponds to the GET
 *    function in the provider's +server.ts file.
 * 5. That GET function validates the state and callback and extracts
 *    the user's email from the provider's API if necessary (how this is
 *    done depends on the provider), making sure that the email is
 *    verified as well. This is required because every account must have
 *    an email associated with it for receiving communications.
 * 6. The GET function then calls the _upsert function below to create
 *    or link accounts as needed, sets up a session, and redirects the
 *    user to the home page.
 */
import { githubAuth, googleAuth } from '$lib/lucia';
import { prisma } from '$lib/trpc/db';
import type { ProviderUserAuth } from '@lucia-auth/oauth/dist/core/provider.js';

export const GET = async ({ cookies, url }) => {
	const provider = getProvider(url.searchParams.get('provider'));
	if (provider === null) {
		return new Response(null, { status: 404 });
	}
	const [redirect, state] = await provider.getAuthorizationUrl();
	cookies.set('state', state, { path: '/', maxAge: 60 });
	return new Response(null, {
		status: 302,
		headers: { location: redirect.toString() },
	});
};

function getProvider(provider: string | null) {
	if (provider === 'google') {
		return googleAuth;
	} else if (provider === 'github') {
		return githubAuth;
	} else {
		return null;
	}
}

/**
 * "Upserts" a user; that is, creates a new user if no user has
 * registered with this email, or links a provider account as a new
 * login method for an existing user.
 *
 * NOTE: Make sure the email is verified before calling this function!
 */
export async function _upsert(providerUserAuth: ProviderUserAuth, email: string) {
	email = email.trim().toLowerCase();
	const user = await prisma.authUser.findUnique({
		where: { email },
	});
	// If no user has registered with this email, create a new user
	if (user === null) {
		const newUser = await providerUserAuth.createUser({
			attributes: {
				email,
				roles: ['HACKER'],
				status: 'CREATED',
				verifiedEmail: true,
			},
		});
		return newUser.id;
	} else if (providerUserAuth.getExistingUser() === null) {
		// Otherwise, link the accounts
		await providerUserAuth.createKey(user.id);
	}
	return user.id;
}
