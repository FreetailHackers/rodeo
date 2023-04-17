import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { QuestionType, Role } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return { questions: await trpc(cookies).questions.get() };
};

export const actions: Actions = {
	create: async ({ cookies, request }) => {
		const formData = await request.formData();
		await trpc(cookies).questions.create(formData.get('type') as QuestionType);
	},

	update: async ({ cookies, request }) => {
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
		}
		await trpc(cookies).questions.update(questions);
	},

	delete: async ({ cookies, request }) => {
		const formData = await request.formData();
		await trpc(cookies).questions.delete(formData.get('id') as string);
	},
};
