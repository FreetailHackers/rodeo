import type { Cookies } from '@sveltejs/kit';
import { admissionsRouter } from './routes/admissions';
import { announcementsRouter } from './routes/announcements';
import { eventsRouter } from './routes/events';
import { questionsRouter } from './routes/questions';
import { settingsRouter } from './routes/settings';
import { usersRouter } from './routes/users';
import { createContext, t } from './t';

export const router = t.router({
	admissions: admissionsRouter,
	announcements: announcementsRouter,
	events: eventsRouter,
	questions: questionsRouter,
	settings: settingsRouter,
	users: usersRouter,
});

export function trpc(cookies: Cookies) {
	return router.createCaller(createContext(cookies.get('magicLink') ?? ''));
}

export function trpcTest(magicLink: string) {
	return router.createCaller(createContext(magicLink));
}

export type Router = typeof router;
