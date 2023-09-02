import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);

	const questions = await trpc(locals.auth).questions.get();
	const questionWithStats = questions
		.filter((question) => question.type === 'RADIO' || question.type === 'DROPDOWN')
		.map((question) => ({ label: question.label, id: question.id }));

	return {
		questionsData: await trpc(locals.auth).users.getAnswersForQuestions(questionWithStats),
		questions,
		graph: await trpc(locals.auth).users.getStatusChanges(),
	};
};
