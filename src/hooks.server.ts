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

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user, sessionRenewed } = await auth.validateSessionToken(sessionToken);

	if (session) {
		if (sessionRenewed) {
			auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
		}
	} else {
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
