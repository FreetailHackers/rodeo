import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ORGANIZER', 'ADMIN']);
	const questions = await trpc(event).questions.get();
	const scanRelevantQuestions = questions.filter((question) => !question.hideScan);
	return {
		questions: scanRelevantQuestions,
		settings: await trpc(event).settings.getPublic(),
		scans: event.url.searchParams.has('stats')
			? await trpc(event).users.getScanLog(event.params.action)
			: null,
	};
};

export const actions = {
	scan: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id') as string;
		const action = formData.get('action') as string;
		await trpc(event).users.scan({ id, action });
	},
};
