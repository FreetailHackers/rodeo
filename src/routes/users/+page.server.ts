import fuzzysort from 'fuzzysort';
import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ cookies, url }) => {
	await authenticate(cookies, Role.ADMIN);
	const users = await trpc(cookies).getUsers();
	const search = url.searchParams.get('search');
	if (search === null) {
		return { users };
	}
	if (search == '') {
		throw redirect(301, url.pathname);
	}
	const results = fuzzysort.go(search, users, {
		keys: ['name', 'email', 'major', 'status', 'role'],
	});
	return { users: results.map((user) => user.obj), search };
}) satisfies PageServerLoad;

export const actions: Actions = {
	accept: async ({ cookies, request }) => {
		const data = await request.formData();
		await trpc(cookies).acceptUsers([...data.keys()].map((id) => Number(id)));
	},

	reject: async ({ cookies, request }) => {
		const data = await request.formData();
		await trpc(cookies).rejectUsers([...data.keys()].map((id) => Number(id)));
	},

	waitlist: async ({ cookies, request }) => {
		const data = await request.formData();
		await trpc(cookies).waitlistUsers([...data.keys()].map((id) => Number(id)));
	},
};
