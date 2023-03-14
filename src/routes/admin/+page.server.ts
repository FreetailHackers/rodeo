import authenticate from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Role } from '@prisma/client';
import type { Actions } from './$types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ cookies }) => {
	await authenticate(cookies, [Role.ADMIN]);
	return {
		settings: await trpc(cookies).getAllSettings(),
		decisions: await trpc(cookies).getDecisions(),
	};
};

export const actions: Actions = {
	settings: async ({ cookies, request }) => {
		const formData = await request.formData();
		const applicationOpen = formData.get('applicationOpen') === 'on';
		let confirmBy: Date | null;
		try {
			confirmBy = dayjs
				.tz(formData.get('confirmBy') as string, formData.get('timezone') as string)
				.toDate();
		} catch (e) {
			confirmBy = null;
		}
		const acceptanceTemplate = formData.get('acceptanceTemplate') as string;
		await trpc(cookies).setSettings({ applicationOpen, confirmBy, acceptanceTemplate });
	},

	release: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).releaseDecisions(ids);
	},

	remove: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).removeDecisions(ids);
	},

	releaseAll: async ({ cookies }) => {
		await trpc(cookies).releaseAllDecisions();
	},
};
