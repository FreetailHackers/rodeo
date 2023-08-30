import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import type { Status } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		settings: await trpc(locals.auth).settings.getAll(),
	};
};

export const actions = {
	emailByStatus: async ({ locals, request }) => {
		const formData = await request.formData();
		const status = formData.get('status') as Status;
		const emailTitle = formData.get('emailTitle') as string;
		const emailBody = formData.get('emailBody') as string;
		await trpc(locals.auth).users.sendEmailByStatus({ status, emailTitle, emailBody });
	},

	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const homepageText = formData.get('homepageText') as string;
		const submitTemplate = formData.get('submitTemplate') as string;
		const acceptTemplate = formData.get('acceptTemplate') as string;
		const rejectTemplate = formData.get('rejectTemplate') as string;
		const waitlistTemplate = formData.get('waitlistTemplate') as string;
		const confirmTemplate = formData.get('confirmTemplate') as string;
		const declineTemplate = formData.get('declineTemplate') as string;
		await trpc(locals.auth).settings.update({
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
};
