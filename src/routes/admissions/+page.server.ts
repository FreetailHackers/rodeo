import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const questions = await trpc(event).questions.get();
	const admissionRelevantQuestions = questions.filter((question) => !question.hideAdmission);
	const user = await trpc(event).admissions.getAppliedUser();
	return {
		user: user,
		questions: admissionRelevantQuestions,
		teammates: user !== null ? await trpc(event).team.getTeammates(user.authUserId) : [],
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
