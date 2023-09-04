import type { AuthUser } from '@prisma/client';
import { initTRPC, type inferAsyncReturnType } from '@trpc/server';
import type { AuthRequest } from 'lucia';
import SuperJSON from 'superjson';

export function createContext(auth: AuthRequest) {
	return auth;
}
type Context = inferAsyncReturnType<typeof createContext>;
export const t = initTRPC.context<Context>().create({ transformer: SuperJSON });

export function createContextTest(user: AuthUser | null) {
	return { validateUser: () => ({ user }) };
}
type ContextTest = inferAsyncReturnType<typeof createContextTest>;
export const tTest = initTRPC.context<ContextTest>().create({ transformer: SuperJSON });
