import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import SuperJSON from 'superjson';

export function createContext(magicLink: string) {
	return { magicLink };
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: SuperJSON });
