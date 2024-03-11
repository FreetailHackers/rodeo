import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals, params, url }) => {
	await authenticate(locals.auth, ['ORGANIZER', 'ADMIN']);
	const questions = await trpc(locals.auth).questions.get();
	const scanRelevantQuestions = questions.filter((question) => !question.hideScan);
	return {
		questions: scanRelevantQuestions,
		settings: await trpc(locals.auth).settings.getPublic(),
		scans: url.searchParams.has('stats')
			? await trpc(locals.auth).users.getScanLog(params.action)
			: null,
	};
};

export const actions = {
	scan: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const action = formData.get('action') as string;
		await trpc(locals.auth).users.scan({ id, action });
	},
};
