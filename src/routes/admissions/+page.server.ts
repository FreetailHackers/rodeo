import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role, Status } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return {
		user: await trpc(cookies).admissions.getAppliedUser(),
		questions: await trpc(cookies).questions.get(),
	};
};

export const actions: Actions = {
	accept: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).admissions.decide({ decision: Status.ACCEPTED, ids: [id] });
	},

	reject: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).admissions.decide({ decision: Status.REJECTED, ids: [id] });
	},

	waitlist: async ({ cookies, request }) => {
		const id = Number((await request.formData()).get('id'));
		await trpc(cookies).admissions.decide({ decision: Status.WAITLISTED, ids: [id] });
	},
};
