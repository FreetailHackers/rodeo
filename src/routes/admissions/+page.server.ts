import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const questions = await trpc(event).questions.get();

	// Get the role from URL search params, default to HACKER
	const roleParam = event.url.searchParams.get('role');
	const selectedRole = (roleParam as Role) || Role.HACKER;

	// Filter questions for the admissions view based on selected role
	const admissionRelevantQuestions = questions.filter((question) => {
		if (question.hideAdmission) return false;
		if (!question.targetGroup?.length) return true;
		return question.targetGroup.some(
			(targetRole) => targetRole.toLowerCase() === selectedRole.toLowerCase(),
		);
	});

	const user = await trpc(event).admissions.getAppliedUser({ role: selectedRole });
	return {
		user: user,
		questions: admissionRelevantQuestions,
		teammates: user !== null ? await trpc(event).team.getTeammates(user.authUserId) : [],
		selectedRole: selectedRole,
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
