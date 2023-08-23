import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Role, Status } from '@prisma/client';

export const load = async ({ locals, url }) => {
	const user = await authenticate(locals.auth, ['ADMIN']);
	return {
		questions: await trpc(locals.auth).questions.get(),
		users: await trpc(locals.auth).users.search(url.searchParams.get('search') ?? ''),
		user,
		query: Object.fromEntries(url.searchParams),
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
		} else if (action === 'add-role') {
			const role = formData.get('role-to-add') as Role;
			await trpc(locals.auth).users.addRole({ role, ids });
			return 'Added roles!';
		} else if (action === 'remove-role') {
			const role = formData.get('role-to-remove') as Role;
			await trpc(locals.auth).users.removeRole({ role, ids });
			return 'Removed roles!';
		} else if (action === 'release') {
			await trpc(locals.auth).admissions.releaseDecisions(ids);
			return 'Released decisions!';
		}
	},
};
