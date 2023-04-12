import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions } from './$types';

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return {
		users: await trpc(cookies).users.get(),
	};
};

export const actions: Actions = {
	async update({ cookies, request }) {
		const formData = await request.formData();
		const email = formData.get('email') as string;
		const role = formData.get('role') as string;
		await trpc(cookies).users.update({ email, role });
	},

	// email: async ({ cookies, request }) => {
	//     const formData = await request.formData();
	//     const email = formData.get('email') as string;
	//     const subject = formData.get('subject') as string;
	//     const body = formData.get('body') as string;
	//     await trpc(cookies).email.send({ email, subject, body });
	// }
};
