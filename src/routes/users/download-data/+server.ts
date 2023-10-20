import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Parser } from '@json2csv/plainjs';
import type { Prisma, Question } from '@prisma/client';

export const GET = async ({ locals, url }) => {
	await authenticate(locals.auth, ['ADMIN']);
	const results = await trpc(locals.auth).users.search({
		page: 1,
		key: url.searchParams.get('key') ?? '',
		search: url.searchParams.get('search') ?? '',
		limit: 0,
		searchFilter: url.searchParams.get('searchFilter') ?? '',
	});
	const questions = await trpc(locals.auth).questions.get();
	const parser = new Parser();
	const users = [];
	for (const user of results.users) {
		users.push(prepare(user, questions));
	}
	return new Response(parser.parse(users), {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': 'attachment; filename="users.csv"',
		},
	});
};

// Helper function to replace question IDs with their labels
function prepare(
	user: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>,
	questions: Question[]
) {
	function prepareApplication(application: Record<string, unknown>) {
		const prepared: Record<string, unknown> = {};
		for (const question of questions) {
			prepared[question.label] = application[question.id];
		}
		return prepared;
	}
	// "Flatten" User object so CSV is generated correctly
	return {
		...user.authUser,
		...prepareApplication(user.application as Record<string, unknown>),
		decision: user.decision?.status,
		...(user.scanCount as object),
	};
}
