import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import { normalizeString, nameLikelyMatches } from '$lib/blacklist';
import { prisma } from '$lib/trpc/db';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const questions = await trpc(event).questions.get();

	const roleParam = event.url.searchParams.get('role');
	const statusParam = event.url.searchParams.get('status');
	const selectedRole = (roleParam as Role) || Role.HACKER;
	const selectedStatus = statusParam ? (statusParam as Status) : undefined;

	const admissionRelevantQuestions = questions.filter((question) => {
		if (question.hideAdmission) return false;
		if (!question.targetGroup?.length) return true;
		return question.targetGroup.some(
			(targetRole) => targetRole.toLowerCase() === selectedRole.toLowerCase(),
		);
	});

	const user = await trpc(event).admissions.getAppliedUser({
		role: selectedRole,
		status: selectedStatus,
	});

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
			emailsFromSettings = (s?.blacklistEmails ?? []).map(normalizeString);
			namesFromSettings = s?.blacklistNames ?? [];
		} catch (_) {
			// ignore
		}
		const emailHitA = emailsFromSettings.includes(normalizeString(email));
		const nameHitA = name && namesFromSettings.some((w) => nameLikelyMatches(name, w));

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
							(b.email && normalizeString(String(b.email)) === normalizeString(email)) ||
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
		selectedStatus: selectedStatus,
	};
};

export const actions = {
	accept: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'ACCEPTED', ids: [id] });
	},

	reject: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'REJECTED', ids: [id] });
	},

	waitlist: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'WAITLISTED', ids: [id] });
	},
};
