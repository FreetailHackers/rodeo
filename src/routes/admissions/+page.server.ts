import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const questions = await trpc(event).questions.get();

	const roleParam = event.url.searchParams.get('role');
	const statusParam = event.url.searchParams.get('status');
	const selectedRole = (roleParam as Role) || Role.HACKER;
	const selectedStatus = statusParam ? (statusParam as Status) : undefined;

	const admissionRelevantQuestions = questions.filter((question) => {
		if (question.hideAdmission) return false;
		if (!question.targetGroup?.length) return true;
		return question.targetGroup.some(
			(targetRole) => targetRole.toLowerCase() === selectedRole.toLowerCase(),
		);
	});

	const user = await trpc(event).admissions.getAppliedUser({
		role: selectedRole,
		status: selectedStatus,
	});

	if (user) {
		let blacklistHit = false;
		if (user) {
			blacklistHit = !!user.isBlacklisted;
		}
	}

	return {
		user,
		questions: admissionRelevantQuestions,
		teammates: user !== null ? await trpc(event).team.getTeammates(user.authUserId) : [],
		selectedRole,
		blacklistHit: !!user?.isBlacklisted,
		selectedStatus: selectedStatus,
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
