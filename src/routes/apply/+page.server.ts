import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';
import { Role } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const user = await authenticate(cookies, [Role.HACKER]);
	return {
		user,
		questions: await trpc(cookies).questions.get(),
		settings: await trpc(cookies).settings.getPublic(),
	};
};

export const actions: Actions = {
	save: async ({ cookies, request }) => {
		const application = Object.fromEntries(await request.formData());
		await trpc(cookies).users.update(application as Record<string, string>);
	},

	finish: async ({ cookies, request }) => {
		if (!(await trpc(cookies).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		const application = Object.fromEntries(await request.formData());
		await trpc(cookies).users.update(application as Record<string, string>);
		return await trpc(cookies).users.submitApplication();
	},

	withdraw: async ({ cookies }) => {
		if (!(await trpc(cookies).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		await trpc(cookies).users.withdrawApplication();
	},

	confirm: async ({ cookies }) => {
		await trpc(cookies).users.rsvp('CONFIRMED');
	},

	decline: async ({ cookies }) => {
		await trpc(cookies).users.rsvp('DECLINED');
	},
};
