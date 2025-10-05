import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	const settings = await trpc(event).settings.getAll();

	return {
		emails: settings.blacklistEmails ?? [],
		names: settings.blacklistNames ?? [],
	};
};

export const actions = {
	save: async (event) => {
		await authenticate(event.locals.session, ['ADMIN']);

		const fd = await event.request.formData();

		// arrays are serialized as JSON strings from the form
		let emails: string[] = [];
		let names: string[] = [];
		try {
			emails = JSON.parse((fd.get('emails') as string) ?? '[]');
			names = JSON.parse((fd.get('names') as string) ?? '[]');
		} catch {
			// leave defaults
		}

		const res = await trpc(event).settings.updateBlacklist({ emails, names });
		return { ok: true, emails: res.emails, names: res.names };
	},
};
