import { building } from '$app/environment';
import prisma from '$lib/trpc/db';
import { router } from '$lib/trpc/router';
import { createContext } from '$lib/trpc/t';
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
