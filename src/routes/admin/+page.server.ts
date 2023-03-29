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
		settings: await trpc(cookies).settings.getAll(),
		decisions: await trpc(cookies).admissions.getDecisions(),
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
		await trpc(cookies).settings.update({ applicationOpen, confirmBy, acceptanceTemplate });
	},

	updateHomepage: async ({ cookies, request }) => {
		const formData = await request.formData();
		const homepageText = formData.get('homepageText') as string;
		await trpc(cookies).settings.update({ homepageText });
	},

	release: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.releaseDecisions(ids);
	},

	remove: async ({ cookies, request }) => {
		const ids = [...(await request.formData()).keys()].map((id) => Number(id));
		await trpc(cookies).admissions.removeDecisions(ids);
	},

	releaseAll: async ({ cookies }) => {
		await trpc(cookies).admissions.releaseAllDecisions();
	},
};
