import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Question } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['HACKER']);
	return {
		user: await trpc(locals.auth).users.get(),
		questions: await trpc(locals.auth).questions.get(),
		settings: await trpc(locals.auth).settings.getPublic(),
	};
};

function formToApplication(questions: Question[], formData: FormData) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const application: Record<string, any> = {};
	for (const question of questions) {
		if (question.type === 'SENTENCE' || question.type === 'PARAGRAPH') {
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
				application[question.id] = JSON.parse(selected).value;
			} catch (e) {
				// Needed because JSON.parse on an empty string errors
				console.error(e);
			}
		}
		if (question.type === 'MULTISELECT') {
			const selected = formData.get(question.id) as string;
			try {
				application[question.id] = JSON.parse(selected).map(
					(item: { value: string }) => item.value
				);
			} catch (e) {
				console.error(e);
			}
		} else if (question.type === 'RADIO') {
			const selected = formData.get(question.id) as string;
			application[question.id] = selected;
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
		if (!(await trpc(locals.auth).settings.getPublic()).applicationOpen) {
			throw redirect(301, '/apply');
		}
		await trpc(locals.auth).users.update(
			formToApplication(await trpc(locals.auth).questions.get(), await request.formData())
		);
		return await trpc(locals.auth).users.submitApplication();
	},

	withdraw: async ({ locals }) => {
		if (!(await trpc(locals.auth).settings.getPublic()).applicationOpen) {
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
