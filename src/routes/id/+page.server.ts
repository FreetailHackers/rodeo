import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	const questions = await trpc(locals.auth).questions.get();
	const user = await authenticate(locals.auth, ['ADMIN', 'SPONSOR']);

	return {
		user: await authenticate(locals.auth),
		questions: user.roles.includes('ADMIN')
			? questions
			: questions.filter((question) => question.sponsorView),
	};
};
