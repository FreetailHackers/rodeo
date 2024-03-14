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
		const subject = formData.get('subject') as string;
		const emailBody = formData.get('emailBody') as string;
		return trpc(locals.auth).users.sendEmailByStatus({ status, subject, emailBody });
	},

	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		const submitTemplate = formData.get('submitTemplate') as string;
		const acceptTemplate = formData.get('acceptTemplate') as string;
		const rejectTemplate = formData.get('rejectTemplate') as string;
		const waitlistTemplate = formData.get('waitlistTemplate') as string;
		const confirmTemplate = formData.get('confirmTemplate') as string;
		const declineTemplate = formData.get('declineTemplate') as string;
		await trpc(locals.auth).settings.update({
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
