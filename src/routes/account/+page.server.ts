import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	const user = await authenticate(event.locals.session, []);

	if (user.roles.includes('HACKER')) {
		const groupName = await trpc(event).users.getGroup();
		let qrCodeStyle = null;
		let imageUrl = null;

		if (groupName) {
			qrCodeStyle = (await trpc(event).qrCodeStyle.get(groupName)) as {
				imageKey?: string;
				dotsOptions?: {
					color: string;
					type: string;
				};
				backgroundOptions?: {
					color: string;
				};
			};

			if (qrCodeStyle?.imageKey) {
				imageUrl = await trpc(event).qrCodeStyle.getImageUrl(qrCodeStyle.imageKey);
			}
		}

		return {
			user: user,
			team: await trpc(event).team.getTeam(),
			invitations: await trpc(event).team.getTeamInvitations(),
			group: await trpc(event).users.getGroup(),
			qrCodeStyle: qrCodeStyle,
			imageUrl: imageUrl,
		};
	}

	return {
		user: user,
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
