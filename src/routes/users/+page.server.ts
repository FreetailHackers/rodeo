import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return { users: await trpc(cookies).getUsers() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		const formData = await request.formData();
		const fullName = formData.get('fullName') as string;
		const email = formData.get('email') as string;
		const role = formData.get('role') as Role;
		return await trpc(cookies).createUser({ fullName, email, role });
	},

	accept: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).decideUsers({ decision: Status.ACCEPTED, ids });
	},

	reject: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).decideUsers({ decision: Status.REJECTED, ids });
	},

	waitlist: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).decideUsers({ decision: Status.WAITLISTED, ids });
	},
};
