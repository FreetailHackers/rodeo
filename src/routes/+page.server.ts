import { googleAuth, githubAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';
import { authenticate } from '$lib/authenticate';
import type { Question } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['HACKER']);

	return {
		user: await trpc(locals.auth).users.get(),
		rsvpDeadline: await trpc(locals.auth).users.getRSVPDeadline(),
		settings: await trpc(locals.auth).settings.getPublic(),
		questions: await trpc(locals.auth).questions.get(),

		// Check whether various OAuth providers are set up in
		// environment variables so we can show/hide buttons.
		providers: {
			google: googleAuth !== null,
			github: githubAuth !== null,
		},
		canApply: await trpc(locals.auth).admissions.canApply(),
	};
};

function formToApplication(questions: Question[], formData: FormData) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const application: Record<string, any> = {};
	for (const question of questions) {
		if (
			question.type === 'SENTENCE' ||
			question.type === 'PARAGRAPH' ||
			question.type === 'RADIO' ||
			question.type === 'FILE'
		) {
			application[question.id] = formData.get(question.id);
		} else if (question.type === 'NUMBER') {
			application[question.id] = Number(formData.get(question.id));
			if (isNaN(application[question.id])) {
				application[question.id] = undefined;
			}
		} else if (question.type === 'CHECKBOX') {
			application[question.id] = formData.get(question.id) === 'on';
		} else if (question.type === 'DROPDOWN') {
			const selected = formData.get(question.id) as string;
			try {
				application[question.id] = JSON.parse(selected);
			} catch (ignore) {
				// empty try-catch needed because JSON.parse on an empty string errors
			}
		}
	}
	return application;
}

export const actions = {
	save: async ({ locals, request }) => {
		await trpc(locals.auth).users.update(
			formToApplication(await trpc(locals.auth).questions.get(), await request.formData())
		);
	},

	finish: async ({ locals, request }) => {
		if (!(await trpc(locals.auth).admissions.canApply())) {
			throw redirect(301, '/apply');
		}
		await trpc(locals.auth).users.update(
			formToApplication(await trpc(locals.auth).questions.get(), await request.formData())
		);
		return await trpc(locals.auth).users.submitApplication();
	},

	withdraw: async ({ locals }) => {
		if (!(await trpc(locals.auth).admissions.canApply())) {
			throw redirect(301, '/apply');
		}
		await trpc(locals.auth).users.withdrawApplication();
	},

	confirm: async ({ locals }) => {
		await trpc(locals.auth).users.rsvp('CONFIRMED');
	},

	decline: async ({ locals }) => {
		await trpc(locals.auth).users.rsvp('DECLINED');
	},
};
