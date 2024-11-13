import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Role } from '.prisma/client';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		settings: await trpc(locals.auth).settings.getAll(),
	};
};

export const actions = {
	inviteToRodeo: async ({ locals, request }) => {
		const formData = await request.formData();
		const emailsToInvite = (formData.get('emailsToInvite') as string)
			.split('\r\n')
			.map((option: string) => option.trim())
			.filter(Boolean);

		const role = formData.get('role') as Role;
		const inviteUsersIsHTML = formData.get('inviteUsersIsHTML') === 'on';

		await trpc(locals.auth).settings.update({ inviteUsersIsHTML });
		return await trpc(locals.auth).users.inviteUsersForRoles({
			emailsToInvite,
			role,
			inviteUsersIsHTML,
		});
	},
};
