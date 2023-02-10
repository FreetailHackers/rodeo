import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, Role.ADMIN);
	return { users: await trpc(cookies).getUsers() };
}) satisfies PageServerLoad;

export const actions: Actions = {
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
