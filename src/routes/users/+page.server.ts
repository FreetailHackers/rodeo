import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Role, Status } from '@prisma/client';

// ✨ add these
import { getSettings } from '$lib/trpc/routes/settings';
import { norm, nameLikelyMatches } from '$lib/blacklist';

export const load = async (event) => {
	const user = await authenticate(event.locals.session, ['ADMIN', 'SPONSOR']);

	// existing data fetches
	const results = await trpc(event).users.search({
		page: Number(event.url.searchParams.get('page') ?? 1),
		key: event.url.searchParams.get('key') ?? '',
		search: event.url.searchParams.get('search') ?? '',
		limit: Number(event.url.searchParams.get('limit') ?? 10),
		searchFilter: event.url.searchParams.get('searchFilter') ?? '',
	});

	const questions = await trpc(event).questions.get();

	// ✨ load blacklist settings server-side (not getPublic)
	const settings = await getSettings();
	const blEmails = (settings.blacklistEmails ?? []).map(norm);
	const blNames = settings.blacklistNames ?? [];

	// attach teammates + isBlacklisted per row
	const users = await Promise.all(
		results.users.map(async (hacker) => {
			const email = hacker.authUser?.email ?? '';
			const name = hacker.authUser?.githubUsername ?? hacker.authUser?.email ?? '';

			const isBlacklisted =
				blEmails.includes(norm(email)) ||
				(!!name && blNames.some((w) => nameLikelyMatches(name, w)));

			return {
				...hacker,
				isBlacklisted,
				teammates: event.locals.user.roles.includes('ADMIN')
					? await trpc(event).team.getTeammates(hacker.authUserId)
					: [],
			};
		}),
	);

	return {
		settings: await trpc(event).settings.getPublic(), // keep your existing public settings for UI
		questions: event.locals.user.roles.includes('ADMIN')
			? questions
			: questions.filter((q) => q.sponsorView),
		users,
		pages: results.pages,
		start: results.start,
		count: results.count,
		user,
		query: Object.fromEntries(event.url.searchParams),
	};
};

export const actions = {
	bulk: async (event) => {
		const formData = await event.request.formData();
		const action = formData.get('action') as string;
		const ids: string[] = [];
		for (const key of formData.keys()) {
			if (key.startsWith('id')) ids.push(key.split(' ')[1]);
		}
		if (action === 'admissions') {
			const decision = formData.get('user-admissions') as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
			await trpc(event).admissions.decide({ decision, ids });
			return 'Saved decisions!';
		} else if (action === 'status') {
			const status = formData.get('user-status') as Status;
			await trpc(event).users.setStatuses({ status, ids });
			return 'Saved statuses!';
		} else if (action === 'add-role') {
			const role = formData.get('role-to-add') as Role;
			await trpc(event).users.addRole({ role, ids });
			return 'Added roles!';
		} else if (action === 'remove-role') {
			const role = formData.get('role-to-remove') as Role;
			await trpc(event).users.removeRole({ role, ids });
			return 'Removed roles!';
		} else if (action === 'release') {
			await trpc(event).admissions.releaseDecisions(ids);
			return 'Released decisions!';
		}
	},
};
