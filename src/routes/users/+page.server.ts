import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';

export const load = async ({ cookies }) => {
	const user = await authenticate(cookies, [Role.ADMIN]);
	return {
		questions: await trpc(cookies).questions.get(),
		users: await trpc(cookies).users.getAll(),
		user,
	};
};

export const actions = {
	create: async ({ cookies, request }) => {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const role = formData.get('role') as Role;
		return await trpc(cookies).users.create({ email, role });
	},

	bulk: async ({ cookies, request }) => {
		const formData = await request.formData();
		const action = formData.get('action') as string;
		const ids: number[] = [];
		for (const key of formData.keys()) {
			if (key.startsWith('id')) {
				ids.push(Number(key.split('.')[1]));
			}
		}
		if (action === 'admissions') {
			const decision = formData.get('user-admissions') as 'ACCEPTED' | 'REJECTED' | 'WAITLISTED';
			await trpc(cookies).admissions.decide({ decision, ids });
		} else if (action === 'status') {
			const status = formData.get('user-status') as Status;
			await trpc(cookies).users.setStatuses({ status, ids });
		} else if (action === 'role') {
			const role = formData.get('user-role') as Role;
			await trpc(cookies).users.setRoles({ role, ids });
		} else if (action === 'release') {
			await trpc(cookies).admissions.releaseDecisions(ids);
		}
	},

	accept: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.decide({ decision: Status.ACCEPTED, ids });
	},
};
