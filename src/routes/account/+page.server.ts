import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	const user = await authenticate(event.locals.session, []);

	if (user.roles.includes('HACKER')) {
		return {
			user: user,
			team: await trpc(event).team.getTeam(),
			invitations: await trpc(event).team.getTeamInvitations(),
			group: await trpc(event).users.getGroup(),
			qrCodeStyle: await trpc(event).users.getQRCodeStyle(),
		};
	}

	return {
		user: user,
		qrCodeStyle: await trpc(event).users.getQRCodeStyle(),
	};
};

export const actions = {
	createTeam: async (event) => {
		const name = (await event.request.formData()).get('teamName') as string;
		await trpc(event).team.createTeam(name);
		return 'Created team!';
	},

	leaveTeam: async (event) => {
		await trpc(event).team.leaveTeam();
		return 'Left team!';
	},

	inviteUser: async (event) => {
		const email = (await event.request.formData()).get('inviteEmail') as string;
		return await trpc(event).team.inviteUser(email);
	},

	removeTeammate: async (event) => {
		const id = (await event.request.formData()).get('memberId') as string;
		return await trpc(event).team.removeTeammate(id);
	},
};
