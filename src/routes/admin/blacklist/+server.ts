import type { RequestHandler, RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/trpc/db';
import { Role } from '@prisma/client';

const SESSION_COOKIE = 'session';

async function getSessionFromEvent(event: RequestEvent) {
	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return null;
	const sesh = await prisma.authSession.findUnique({
		where: { id: token },
		include: { authUser: true },
	});
	if (!sesh) return null;
	return { user: sesh.authUser };
}

function isAdmin(session: { user: { roles: Role[] } } | null) {
	return !!session?.user?.roles?.includes(Role.ADMIN);
}

async function ensureSettingsRow() {
	let s = await prisma.settings.findUnique({ where: { id: 0 } });
	if (!s) {
		await prisma.settings.create({ data: { id: 0 } });
		s = await prisma.settings.update({
			where: { id: 0 },
			data: { blacklistEmails: [], blacklistNames: [] },
		});
	}
	return s;
}

export const GET: RequestHandler = async (event) => {
	const session = await getSessionFromEvent(event);
	if (!isAdmin(session)) return new Response('Forbidden', { status: 403 });

	const s = await ensureSettingsRow();
	return new Response(
		JSON.stringify({
			emails: s.blacklistEmails ?? [],
			names: s.blacklistNames ?? [],
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
};

export const PUT: RequestHandler = async (event) => {
	const session = await getSessionFromEvent(event);
	if (!isAdmin(session)) return new Response('Forbidden', { status: 403 });

	const body = await event.request.json().catch(() => ({}));
	let { emails, names } = (body ?? {}) as { emails?: string[]; names?: string[] };

	const normEmail = (s: string) => s.trim().toLowerCase();
	const normName = (s: string) => s.trim();

	emails = Array.from(new Set((emails ?? []).map(normEmail))).filter(Boolean);
	names = Array.from(new Set((names ?? []).map(normName))).filter(Boolean);

	await ensureSettingsRow();
	const s = await prisma.settings.update({
		where: { id: 0 },
		data: { blacklistEmails: emails, blacklistNames: names },
	});

	return new Response(
		JSON.stringify({ ok: true, emails: s.blacklistEmails, names: s.blacklistNames }),
		{ headers: { 'Content-Type': 'application/json' } },
	);
};
