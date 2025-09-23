// src/routes/admissions/+page.server.ts
import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import { norm, nameLikelyMatches } from '$lib/blacklist';
import { prisma } from '$lib/trpc/db';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const questions = await trpc(event).questions.get();

	const roleParam = event.url.searchParams.get('role');
	const selectedRole = (roleParam as Role) || Role.HACKER;

	const admissionRelevantQuestions = questions.filter((q) => {
		if (q.hideAdmission) return false;
		if (!q.targetGroup?.length) return true;
		return q.targetGroup.some((r) => r.toLowerCase() === selectedRole.toLowerCase());
	});

	const user = await trpc(event).admissions.getAppliedUser({ role: selectedRole });

	let blacklistHit = false;
	if (user) {
		const email = (user.authUser.email ?? '').trim();
		const app = (user.application ?? {}) as Record<string, unknown>;
		const first =
			(typeof app.firstName === 'string' && app.firstName) ||
			(typeof app.name === 'string' && app.name) ||
			'';
		const last = (typeof app.lastName === 'string' && app.lastName) || '';
		const appFullName = [first, last].filter(Boolean).join(' ').trim();

		const fallbackName = (user.authUser.githubUsername ?? '') || (user.authUser.email ?? '');
		const name = (appFullName || fallbackName).trim();
		// Settings arrays (blacklistEmails / blacklistNames)
		let emailsFromSettings: string[] = [];
		let namesFromSettings: string[] = [];
		try {
			const s = await prisma.settings.findFirst({
				select: { blacklistEmails: true, blacklistNames: true },
			});
			emailsFromSettings = (s?.blacklistEmails ?? []).map(norm);
			namesFromSettings = s?.blacklistNames ?? [];
		} catch (_) {
			// ignore
		}
		const emailHitA = emailsFromSettings.includes(norm(email));
		const nameHitA = !!name && namesFromSettings.some((w) => nameLikelyMatches(name, w));

		// TRPC blacklist router (if present)
		let trpcHit = false;
		try {
			const api = trpc(event) as any;
			if (api?.blacklist?.check) {
				trpcHit = !!(await api.blacklist.check({ email, name }));
			} else if (api?.blacklist?.find) {
				trpcHit = !!(await api.blacklist.find({ email, name }));
			} else if (api?.blacklist?.list) {
				const list = await api.blacklist.list();
				trpcHit =
					Array.isArray(list) &&
					list.some(
						(b) =>
							(b.email && norm(String(b.email)) === norm(email)) ||
							(b.name && nameLikelyMatches(name, String(b.name))),
					);
			}
		} catch (_) {
			// ignore
		}

		blacklistHit = emailHitA || nameHitA || trpcHit;
	}

	return {
		user,
		questions: admissionRelevantQuestions,
		teammates: user !== null ? await trpc(event).team.getTeammates(user.authUserId) : [],
		selectedRole,
		blacklistHit: !!user?.isBlacklisted,
	};
};

export const actions = {
	// One handler for Accept / Reject / Waitlist
	default: async (event) => {
		const fd = await event.request.formData();
		const id = fd.get('id') as string | null;
		const decision = fd.get('decision') as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED' | null;

		if (!id || !decision) return {};

		// Calls your existing TRPC mutation (blocks ACCEPTED if blacklisted)
		await trpc(event).admissions.decide({ decision, ids: [id] });

		return { ok: true };
	},
};
