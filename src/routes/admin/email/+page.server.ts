import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	return {
		settings: await trpc(event).settings.getAll(),
	};
};

export const actions = {
	settings: async (event) => {
		const formData = await event.request.formData();
		const submitTemplate = formData.get('submitTemplate') as string;
		const acceptTemplate = formData.get('acceptTemplate') as string;
		const rejectTemplate = formData.get('rejectTemplate') as string;
		const waitlistTemplate = formData.get('waitlistTemplate') as string;
		const confirmTemplate = formData.get('confirmTemplate') as string;
		const declineTemplate = formData.get('declineTemplate') as string;
		const withdrawalWarningTemplate = formData.get('withdrawalWarningTemplate') as string;
		const submitIsHTML = formData.get('submitFormType') === 'on';
		const acceptIsHTML = formData.get('acceptFormType') === 'on';
		const rejectIsHTML = formData.get('rejectFormType') === 'on';
		const waitlistIsHTML = formData.get('waitlistFormType') === 'on';
		const confirmIsHTML = formData.get('confirmFormType') === 'on';
		const declineIsHTML = formData.get('declineFormType') === 'on';
		const withdrawIsHTML = formData.get('withdrawFormType') === 'on';
		await trpc(event).settings.update({
			submitTemplate,
			acceptTemplate,
			rejectTemplate,
			waitlistTemplate,
			confirmTemplate,
			declineTemplate,
			withdrawalWarningTemplate,
			submitIsHTML,
			acceptIsHTML,
			rejectIsHTML,
			waitlistIsHTML,
			confirmIsHTML,
			declineIsHTML,
			withdrawIsHTML,
		});
		return 'Saved settings!';
	},
};
