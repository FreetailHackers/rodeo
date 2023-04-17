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
		decisions: await trpc(cookies).admissions.getDecisions(),
		settings: await trpc(cookies).settings.getAll(),
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
		const homepageText = formData.get('homepageText') as string;
		const submitTemplate = formData.get('submitTemplate') as string;
		const acceptTemplate = formData.get('acceptTemplate') as string;
		const rejectTemplate = formData.get('rejectTemplate') as string;
		const waitlistTemplate = formData.get('waitlistTemplate') as string;
		const confirmTemplate = formData.get('confirmTemplate') as string;
		const declineTemplate = formData.get('declineTemplate') as string;
		await trpc(cookies).settings.update({
			applicationOpen,
			confirmBy,
			homepageText,
			submitTemplate,
			acceptTemplate,
			rejectTemplate,
			waitlistTemplate,
			confirmTemplate,
			declineTemplate,
		});
		return 'Saved settings!';
	},

	release: async ({ cookies }) => {
		await trpc(cookies).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},
};
