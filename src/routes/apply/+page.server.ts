import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions } from './$types';
import { Role, type Question } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const user = await authenticate(cookies, [Role.HACKER]);
	return {
		user,
		questions: await trpc(cookies).questions.get(),
		settings: await trpc(cookies).settings.getPublic(),
	};
};

function formToApplication(questions: Question[], formData: FormData) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const application: Record<string, any> = {};
	for (const question of questions) {
		if (formData.get(question.id) === '') {
			application[question.id] = undefined;
			continue;
		}
		if (question.type === 'SENTENCE' || question.type === 'PARAGRAPH') {
			application[question.id] = formData.get(question.id);
		} else if (question.type === 'NUMBER') {
			application[question.id] = Number(formData.get(question.id));
			if (isNaN(application[question.id])) {
				application[question.id] = undefined;
			}
		}
	}
	return application;
}

export const actions: Actions = {
	save: async ({ cookies, request }) => {
		await trpc(cookies).users.update(
			formToApplication(await trpc(cookies).questions.get(), await request.formData())
		);
	},

	finish: async ({ cookies, request }) => {
		if (!(await trpc(cookies).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		await trpc(cookies).users.update(
			formToApplication(await trpc(cookies).questions.get(), await request.formData())
		);
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
