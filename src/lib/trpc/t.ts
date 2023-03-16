import type { Cookies } from '@sveltejs/kit';
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import SuperJSON from 'superjson';

export function createContext(cookies: Cookies) {
	return { magicLink: cookies.get('magicLink') ?? '' };
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: SuperJSON });
