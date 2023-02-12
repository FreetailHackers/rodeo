import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Actions, PageServerLoad } from './$types';
import { Role } from '@prisma/client';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies }) => {
	const user = await authenticate(cookies, Role.HACKER);
	return {
		user,
		applicationOpen: trpc(cookies).getApplicationOpen(),
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	save: async ({ cookies, request }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const user = {
			...data,
			photoReleaseAgreed: data.photoReleaseAgreed === 'on',
			liabilityWaiverAgreed: data.liabilityWaiverAgreed === 'on',
			codeOfConductAgreed: data.codeOfConductAgreed === 'on',
			hackathonsAttended: Number(data.hackathonsAttended),
			race: formData.getAll('race').map((x) => x as string),
			workshops: formData.getAll('workshops').map((x) => x as string),
			lunch: data.lunch === 'on',
		};
		await trpc(cookies).setUser(user);
		return 'Saved!';
	},

	finish: async ({ cookies, request }) => {
		if (!(await trpc(cookies).getApplicationOpen())) {
			throw redirect(301, '/apply');
		}
		const formData = await request.formData();
		const data = Object.fromEntries(formData);
		const user = {
			...data,
			photoReleaseAgreed: data.photoReleaseAgreed === 'on',
			liabilityWaiverAgreed: data.liabilityWaiverAgreed === 'on',
			codeOfConductAgreed: data.codeOfConductAgreed === 'on',
			hackathonsAttended: Number(data.hackathonsAttended),
			race: formData.getAll('race').map((x) => x as string),
			workshops: formData.getAll('workshops').map((x) => x as string),
			lunch: data.lunch === 'on',
		};
		await trpc(cookies).setUser(user);
		return await trpc(cookies).submitApplication();
	},

	withdraw: async ({ cookies }) => {
		if (!(await trpc(cookies).getApplicationOpen())) {
			throw redirect(301, '/apply');
		}
		await trpc(cookies).setUser({});
	},
};
