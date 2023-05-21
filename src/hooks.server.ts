import { auth } from '$lib/lucia';
import { building } from '$app/environment';
import { prisma } from '$lib/trpc/db';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/t';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

const luciaAuthHandle: Handle = async ({ event, resolve }) => {
	event.locals.auth = auth.handleRequest(event);
	return await resolve(event);
};

const trpcHandle = createTRPCHandle({
	router,
	createContext: async (event) => createContext(event.locals.auth),
});

export const handle = sequence(luciaAuthHandle, trpcHandle);

if (!building) {
	// Set default settings
	await prisma.settings.upsert({
		where: { id: 0 },
		update: {},
		create: {},
	});
}
