import { router, createContext } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

export const handle: Handle = createTRPCHandle({
	router,
	createContext: async (event) => createContext(event.cookies),
});
