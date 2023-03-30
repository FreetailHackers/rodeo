import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return { questions: await trpc(cookies).questions.get() };
};

export const actions: Actions = {
	create: async ({ cookies }) => {
		await trpc(cookies).questions.create();
	},

	update: async ({ cookies, request }) => {
		const questions = Object.fromEntries(await request.formData());
		await trpc(cookies).questions.update(questions as Record<string, string>);
	},

	delete: async ({ cookies, request }) => {
		const formData = await request.formData();
		await trpc(cookies).questions.delete(formData.get('id') as string);
	},
};
