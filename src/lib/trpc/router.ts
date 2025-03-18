import type { AuthUser } from '@prisma/client';
import { admissionsRouter } from './routes/admissions';
import { announcementsRouter } from './routes/announcements';
import { eventsRouter } from './routes/events';
import { faqRouter } from './routes/faq';
import { challengesRouter } from './routes/challenges';
import { sponsorsRouter } from './routes/sponsors';
import { questionsRouter } from './routes/questions';
import { settingsRouter } from './routes/settings';
import { usersRouter } from './routes/users';
import { teamRouter } from './routes/team';
import { createContext, createContextTest, t, tTest } from './t';
import type { AuthRequest } from 'lucia';
import { passRouter } from './routes/pass';

const routes = {
	admissions: admissionsRouter,
	announcements: announcementsRouter,
	events: eventsRouter,
	faq: faqRouter,
	challenges: challengesRouter,
	sponsors: sponsorsRouter,
	questions: questionsRouter,
	settings: settingsRouter,
	users: usersRouter,
	team: teamRouter,
	pass: passRouter,
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
