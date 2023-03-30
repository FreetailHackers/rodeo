import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return {
		questions: await trpc(cookies).questions.get(),
		users: await trpc(cookies).users.getAll(),
	};
};

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const email = formData.get('email') as string;
		const role = formData.get('role') as Role;
		return await trpc(cookies).users.create({ fullName, email, role });
	},

	accept: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.decide({ decision: Status.ACCEPTED, ids });
	},

	reject: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.decide({ decision: Status.REJECTED, ids });
	},

	waitlist: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.decide({ decision: Status.WAITLISTED, ids });
	},

	confirm: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.confirmWalkIns(ids);
	},
};
