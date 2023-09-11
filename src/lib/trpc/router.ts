import type { AuthUser } from '@prisma/client';
import { admissionsRouter } from './routes/admissions';
import { announcementsRouter } from './routes/announcements';
import { eventsRouter } from './routes/events';
import { questionsRouter } from './routes/questions';
import { settingsRouter } from './routes/settings';
import { usersRouter } from './routes/users';
import { createContext, createContextTest, t, tTest } from './t';
import type { AuthRequest } from 'lucia';

const routes = {
	admissions: admissionsRouter,
	announcements: announcementsRouter,
	events: eventsRouter,
	questions: questionsRouter,
	settings: settingsRouter,
	users: usersRouter,
};

export const router = t.router(routes);
export const routerTest = tTest.router(routes);

export function trpc(auth: AuthRequest) {
	return router.createCaller(createContext(auth));
}

export function trpcTest(user: AuthUser | null) {
	return routerTest.createCaller(createContextTest(user));
}

export type Router = typeof router;
