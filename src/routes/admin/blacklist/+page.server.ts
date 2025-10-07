import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);

	const { emails, names } = await trpc(event).blacklist.get();

	return { emails, names };
};

export const actions = {
	save: async (event) => {
		await authenticate(event.locals.session, ['ADMIN']);

		const formData = await event.request.formData();

		// arrays are serialized as JSON strings from the form
		let emails: string[] = [];
		let names: string[] = [];
		try {
			emails = JSON.parse((formData.get('emails') as string) ?? '[]');
			names = JSON.parse((formData.get('names') as string) ?? '[]');
		} catch {
			// leave defaults
		}

		const result = await trpc(event).blacklist.replace({ emails, names });
		return { ok: true, emails: result.emails, names: result.names };
	},
};
