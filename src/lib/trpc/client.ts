import type { Router } from '$lib/trpc/router';
import SuperJSON from 'superjson';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
	if (typeof window === 'undefined')
		return createTRPCClient<Router>({ init, transformer: SuperJSON });
	if (!browserClient) browserClient = createTRPCClient<Router>({ transformer: SuperJSON });
	return browserClient;
}
