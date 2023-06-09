import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Role, Status } from '@prisma/client';

export const load = async ({ locals }) => {
	const user = await authenticate(locals.auth, ['ADMIN']);
	return {
		questions: await trpc(locals.auth).questions.get(),
		users: await trpc(locals.auth).users.getAll(),
		user,
	};
};

export const actions = {
	bulk: async ({ locals, request }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;
		const ids: string[] = [];
		for (const key of formData.keys()) {
			if (key.startsWith('id')) {
				ids.push(key.split('.')[1]);
			}
		}
		if (action === 'admissions') {
			const decision = formData.get('user-admissions') as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
			await trpc(locals.auth).admissions.decide({ decision, ids });
			return 'Saved decisions!';
		} else if (action === 'status') {
			const status = formData.get('user-status') as Status;
			await trpc(locals.auth).users.setStatuses({ status, ids });
			return 'Saved statuses!';
		} else if (action === 'role') {
			const role = formData.get('user-role') as Role;
			await trpc(locals.auth).users.setRoles({ role, ids });
			return 'Saved roles!';
		} else if (action === 'release') {
			await trpc(locals.auth).admissions.releaseDecisions(ids);
			return 'Released decisions!';
		}
	},
};
