import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	const questions = await trpc(locals.auth).questions.get();
	const admissionRelevantQuestions = questions.filter((question) => !question.hideAdmission);
	const user = await trpc(locals.auth).admissions.getAppliedUser();
	return {
		user: user,
		questions: admissionRelevantQuestions,
		teammates: user !== null ? await trpc(locals.auth).team.getTeammates(user.authUserId) : [],
	};
};

export const actions = {
	accept: async ({ locals, request }) => {
		const id = (await request.formData()).get('id') as string;
		await trpc(locals.auth).admissions.decide({ decision: 'ACCEPTED', ids: [id] });
	},

	reject: async ({ locals, request }) => {
		const id = (await request.formData()).get('id') as string;
		await trpc(locals.auth).admissions.decide({ decision: 'REJECTED', ids: [id] });
	},

	waitlist: async ({ locals, request }) => {
		const id = (await request.formData()).get('id') as string;
		await trpc(locals.auth).admissions.decide({ decision: 'WAITLISTED', ids: [id] });
	},
};
