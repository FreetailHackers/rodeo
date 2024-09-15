import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	const user = await authenticate(locals.auth);
	const name = await trpc(locals.auth).users.getName();

	if (user.status === 'HACKER') {
		return {
			user: user,
			team: await trpc(locals.auth).team.getUserTeam(),
			invitations: await trpc(locals.auth).team.getTeamInvitations(),
			name: name ?? 'HACKER',
		};
	}

	return {
		user: user,
		name: name ?? 'GUEST',
	};
};

export const actions = {
	createTeam: async ({ locals, request }) => {
		const name = (await request.formData()).get('teamName') as string;
		await trpc(locals.auth).team.createTeam(name);
		return 'Created team!';
	},

	leaveTeam: async ({ locals }) => {
		await trpc(locals.auth).team.leaveTeam();
		return 'Left team!';
	},

	updateDevpost: async ({ locals, request }) => {
		const devpostUrl = (await request.formData()).get('devpostUrl') as string;
		if (!(await trpc(locals.auth).team.uploadDevpost(devpostUrl))) {
			return 'Invalid Devpost URL. Should be in the format https://devpost.com/software/your-project';
		}
		return 'Updated Devpost!';
	},

	inviteUser: async ({ locals, request }) => {
		const email = (await request.formData()).get('inviteEmail') as string;
		const doesEmailExist = await trpc(locals.auth).users.doesEmailExist(email);
		if (!doesEmailExist) {
			return 'The provided email is not associated with any account.';
		}

		const teamSize = await trpc(locals.auth).team.getTeamSize();
		if (teamSize >= 4) {
			return `Your team already has ${teamSize} members, which is the maximum allowed. You cannot invite more users.`;
		}

		await trpc(locals.auth).team.inviteUser(email);
		return 'Invited user!';
	},
};
