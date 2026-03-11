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

	const users = await trpc(event).admissions.getAllAppliedUsers({
		role: selectedRole,
		status: selectedStatus,
	});

	const usersWithTeammates = await Promise.all(
		users.map(async (u) => ({
			...u,
			teammates: u !== null ? await trpc(event).team.getTeammates(u.authUserId) : [],
		})),
	);

	return {
		users: usersWithTeammates,
		questions: admissionRelevantQuestions,
		selectedRole,
		selectedStatus: selectedStatus,
	};
};

export const actions = {
	accept: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'ACCEPTED', ids: [id] });
		await trpc(event).admissions.incrementApplicationCount({
			userId: event.locals.user.id,
			decision: 'ACCEPTED',
		});

		// Dummy timeout of 5 seconds
		await new Promise((resolve) => setTimeout(resolve, 5000));

		return 'ACCEPTED';
	},

	reject: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'REJECTED', ids: [id] });
		await trpc(event).admissions.incrementApplicationCount({
			userId: event.locals.user.id,
			decision: 'REJECTED',
		});

		return 'REJECTED';
	},

	waitlist: async (event) => {
		const id = (await event.request.formData()).get('id') as string;
		await trpc(event).admissions.decide({ decision: 'WAITLISTED', ids: [id] });
		await trpc(event).admissions.incrementApplicationCount({
			userId: event.locals.user.id,
			decision: 'WAITLISTED',
		});

		return 'WAITLISTED';
	},
};
