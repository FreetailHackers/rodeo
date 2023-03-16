import type { Cookies } from '@sveltejs/kit';
import { admissionsRouter } from './routes/admissions';
import { announcementsRouter } from './routes/announcements';
import { eventsRouter } from './routes/events';
import { settingsRouter } from './routes/settings';
import { usersRouter } from './routes/users';
import { createContext, t } from './t';

export const router = t.router({
	admissions: admissionsRouter,
	announcements: announcementsRouter,
	events: eventsRouter,
	settings: settingsRouter,
	users: usersRouter,
});

export function trpc(cookies: Cookies) {
	return router.createCaller(createContext(cookies));
}

export type Router = typeof router;
