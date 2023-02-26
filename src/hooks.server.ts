import { building } from '$app/environment';
import prisma from '$lib/trpc/db';
import { router, createContext } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

export const handle: Handle = createTRPCHandle({
	router,
	createContext: async (event) => createContext(event.cookies),
});

if (!building) {
	// Set default settings
	await prisma.settings.upsert({
		where: { id: 0 },
		update: {},
		create: {},
	});
}
