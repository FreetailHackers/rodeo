import { building } from '$app/environment';
import { prisma } from '$lib/trpc/db';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/t';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import * as auth from '$lib/authenticate';

const trpcHandle = createTRPCHandle({
	router,
	createContext: async (event) => createContext(event),
});

const authHandle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	console.log('Auth handle - session validation:', {
		url: event.url.pathname,
		hostname: event.url.hostname,
		hasSessionToken: !!sessionToken,
		sessionToken: sessionToken ? sessionToken.substring(0, 8) + '...' : null,
	});

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user, sessionRenewed } = await auth.validateSessionToken(sessionToken);

	console.log('Session validation result:', {
		hasSession: !!session,
		hasUser: !!user,
		sessionRenewed,
		userId: user?.id,
	});

	if (session) {
		// Only set the cookie if the session was renewed to avoid unnecessary cookie setting
		if (sessionRenewed) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		}
	} else {
		console.log('Invalid session - deleting cookie');
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

export const handle = sequence(authHandle, trpcHandle);

if (!building) {
	// Set default settings
	await prisma.settings.upsert({
		where: { id: 0 },
		update: {},
		create: {},
	});
}
