import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	const user = await authenticate(locals.auth);
	console.log(user);

	if (user.roles.includes('HACKER')) {
		return {
			user: user,
			team: await trpc(locals.auth).team.getTeam(),
			invitations: await trpc(locals.auth).team.getTeamInvitations(),
			group: await trpc(locals.auth).users.getGroup(),
		};
	}

	return {
		user: user,
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

	inviteUser: async ({ locals, request }) => {
		const email = (await request.formData()).get('inviteEmail') as string;
		return await trpc(locals.auth).team.inviteUser(email);
	},

	removeTeammate: async ({ locals, request }) => {
		const id = (await request.formData()).get('memberId') as string;
		return await trpc(locals.auth).team.removeTeammate(id);
	},
};
