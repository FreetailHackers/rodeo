import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Question, Role, Status } from '@prisma/client';

export const load = async ({ locals, url }) => {
	const user = await authenticate(locals.auth, ['ADMIN']);
	const results = await trpc(locals.auth).users.search({
		page: Number(url.searchParams.get('page') ?? 1),
		key: url.searchParams.get('key') ?? '',
		search: url.searchParams.get('search') ?? '',
		limit: Number(url.searchParams.get('limit') ?? 10),
	});

	// User Statistics
	const userResults = await trpc(locals.auth).users.unrestrictedSearch({
		key: url.searchParams.get('key') ?? '',
		search: url.searchParams.get('search') ?? '',
	});

	const questions = await trpc(locals.auth).questions.get();
	const questionWithStats = questions.filter(
		(question: Question) => question.type === 'RADIO' || question.type === 'DROPDOWN'
	);

	const responses = new Map<string, Map<string, number>>();

	if (Array.isArray(userResults.users)) {
		userResults.users.forEach((user) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const applicationData = user.application as Record<string, any>;
			questionWithStats.forEach((question) => {
				const answer = applicationData[question.id];
				const key = answer ?? 'No answer given';
				if (!responses.has(question.label)) {
					responses.set(question.label, new Map());
				}
				const answerFrequency = responses.get(question.label);
				if (answerFrequency !== undefined) {
					if (!answerFrequency.has(key)) {
						answerFrequency.set(key, 1);
					} else {
						answerFrequency.set(key, (answerFrequency.get(key) || 0) + 1);
					}
				}
			});
		});
	}

	const chartData = Array.from(responses.entries()).map(([label, answerFrequency]) => ({
		questionName: label,
		data: {
			labels: Array.from(answerFrequency.keys()),
			values: Array.from(answerFrequency.values()),
			type: 'pie' as const,
		},
	}));

	return {
		stats: chartData,
		questions: questions,
		users: results.users,
		pages: results.pages,
		start: results.start,
		count: results.count,
		user,
		graph: await trpc(locals.auth).users.getStatusChanges(),
		query: Object.fromEntries(url.searchParams),
	};
};

export const actions = {
	bulk: async ({ locals, request }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;
		const ids: string[] = [];
		for (const key of formData.keys()) {
			if (key.startsWith('id')) {
				ids.push(key.split(' ')[1]);
			}
		}
		if (action === 'admissions') {
			const decision = formData.get('user-admissions') as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
			await trpc(locals.auth).admissions.decide({ decision, ids });
			return 'Saved decisions!';
		} else if (action === 'status') {
			const status = formData.get('user-status') as Status;
			await trpc(locals.auth).users.setStatuses({ status, ids });
			return 'Saved statuses!';
		} else if (action === 'add-role') {
			const role = formData.get('role-to-add') as Role;
			await trpc(locals.auth).users.addRole({ role, ids });
			return 'Added roles!';
		} else if (action === 'remove-role') {
			const role = formData.get('role-to-remove') as Role;
			await trpc(locals.auth).users.removeRole({ role, ids });
			return 'Removed roles!';
		} else if (action === 'release') {
			await trpc(locals.auth).admissions.releaseDecisions(ids);
			return 'Released decisions!';
		}
	},
};
