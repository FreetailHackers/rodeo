import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { QuestionType } from '@prisma/client';

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return { questions: await trpc(locals.auth).questions.get() };
};

export const actions = {
	create: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).questions.create(formData.get('type') as QuestionType);
	},

	moveDown: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).questions.moveDown(formData.get('id') as string);
	},

	moveUp: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).questions.moveUp(formData.get('id') as string);
	},

	update: async ({ locals, request }) => {
		const formData = Object.fromEntries(await request.formData());
		// We have to do a bit of transformation on the form data to
		// get it into the format that the tRPC endpoint expects.

		// The form data is structured like so: the key is a question ID
		// and a question field separated by an underscore. Example:
		// {
		//     '1_label': 'What is your name?',
		//     '1_type': 'SENTENCE',
		//     '1_required': 'on',
		//     ...
		//     '2_label': 'What is your favorite color?',
		//     ...
		// }
		// (Note that in reality, the question IDs are UUIDs, but I use
		// a number here for the sake of demonstration.)

		// tRPC expects the data to be structured as a nested object,
		// with the first-level keys being the question IDs and the
		// second-level keys being the question fields. Example:
		// {
		//     '1': {
		//         label: 'What is your name?',
		//         type: 'SENTENCE',
		//         required: true,
		//         ...
		//     },
		//     '2': {
		//         label: 'What is your favorite color?',
		//         ...
		//     },
		//     ...

		// Therefore, we must loop through the form data and construct
		// the nested object, peforming any necessary type conversions
		// like converting 'on' from the required checkbox to a boolean.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const questions: Record<string, Record<string, any>> = {};
		for (const key in formData) {
			const [id, field] = key.split('_');
			if (!(id in questions)) {
				questions[id] = {};
			}
			questions[id][field] = formData[key];
		}
		// Perform type conversions
		for (const id in questions) {
			questions[id].required = questions[id].required === 'on';
			questions[id].sponsorView = questions[id].sponsorView === 'on';
			questions[id].hideAdmission = questions[id].hideAdmission === 'on';
			questions[id].hideScan = questions[id].hideScan === 'on';
			if (questions[id].type === 'NUMBER') {
				const min = Number(questions[id].min);
				const max = Number(questions[id].max);
				questions[id].min = questions[id].min === '' || Number.isNaN(min) ? null : min;
				questions[id].max = questions[id].max === '' || Number.isNaN(max) ? null : max;
				// If min > max, swap them
				if (
					questions[id].min !== null &&
					questions[id].max !== null &&
					questions[id].min > questions[id].max
				) {
					[questions[id].min, questions[id].max] = [questions[id].max, questions[id].min];
				}
				questions[id].step = Number(questions[id].step) || 1;
			} else if (questions[id].type === 'DROPDOWN' || questions[id].type === 'RADIO') {
				questions[id].options = [
					...new Set(
						questions[id].options
							.split('\r\n')
							.map((option: string) => option.trim())
							.filter(Boolean)
					),
				]; // Remove only whitespace options
				questions[id].multiple = questions[id].multiple === 'on';
				questions[id].custom = questions[id].custom === 'on';
			} else if (questions[id].type === 'FILE') {
				questions[id].maxSizeMB = Number(questions[id].maxSizeMB) || 1;
			}
		}
		await trpc(locals.auth).questions.update(questions);
		return 'Saved questions!';
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		await trpc(locals.auth).questions.delete(formData.get('id') as string);
	},
};
