import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import type { Actions } from '../$types';
import type { PageServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return { user: await trpc(cookies).getAppliedUser() };
}) satisfies PageServerLoad;

export const actions: Actions = {
	accept: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).decideUsers({ decision: Status.ACCEPTED, ids: [id] });
	},

	reject: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).decideUsers({ decision: Status.REJECTED, ids: [id] });
	},

	waitlist: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).decideUsers({ decision: Status.WAITLISTED, ids: [id] });
	},
};
