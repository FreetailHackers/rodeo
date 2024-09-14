import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async ({ locals }) => {
	return {
		user: await authenticate(locals.auth),
		team: await trpc(locals.auth).team.getUserTeam(),
		invitations: await trpc(locals.auth).team.getTeamInvitations(),
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
		await trpc(locals.auth).team.uploadDevpost(devpostUrl);
		return 'Updated Devpost!';
	},

	inviteUser: async ({ locals, request }) => {
		const email = (await request.formData()).get('inviteEmail') as string;
		console.log(email);
		await trpc(locals.auth).team.inviteUser(email);
		return 'Invited user!';
	},
};
