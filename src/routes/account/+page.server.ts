import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import fs from 'node:fs/promises';
import path from 'node:path';

export const load = async ({ locals }) => {
	const user = await authenticate(locals.auth);

	function getObjectFromModelFile(filePath: string, content: Buffer, depthFromEnd: number) {
		const fileComponents = filePath.split(path.sep);
		const fileName = fileComponents.slice(fileComponents.length - depthFromEnd).join('/');

		return { [fileName]: content };
	}

	if (user.roles.includes('HACKER')) {
		const group = await trpc(locals.auth).users.getGroup();
		const modelFilesList = [
			'static/ticket.pass/icon.png',
			'static/ticket.pass/pass.json',
			'static/ticket.pass/strip.png',
			'static/ticket.pass/logo.png',
			'static/ticket.pass/icon@2x.png',
		];

		const modelRecords = (
			await Promise.all(
				modelFilesList.map(async (filePath) => {
					console.log(filePath);
					// Resolve path relative to project root
					const resolvedPath = path.join(process.cwd(), filePath);
					return fs
						.readFile(resolvedPath)
						.then((content) => getObjectFromModelFile(filePath, content, 1));
				})
			)
		).reduce((acc, current) => ({ ...acc, ...current }), {});

		return {
			user: user,
			team: await trpc(locals.auth).team.getTeam(),
			invitations: await trpc(locals.auth).team.getTeamInvitations(),
			group: group ? group : 'No Group',
			pass: await trpc(locals.auth).pass.getPass({
				uid: user.id,
				group: group ? group : 'No Group',
				modelRecords: modelRecords,
			}),
		};
	}

	return {
		user: user,
		pass: await trpc(locals.auth).pass.getPass({
			uid: user.id,
			group: user.roles[0] ? user.roles[0] : 'Organizer',
			modelRecords: null,
		}),
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
