import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);

	const { emails, names } = await trpc(event).blacklist.get();

	return { emails, names };
};

export const actions = {
	add: async (event) => {
		await authenticate(event.locals.session, ['ADMIN']);
		const formData = await event.request.formData();
		const kind = formData.get('kind') as 'email' | 'name';
		const value = (formData.get('value') as string) ?? '';

		await trpc(event).blacklist.add({ kind, value });

		const fresh = await trpc(event).blacklist.get();
		return { ok: true, message: `Added “${value}” to ${kind} blacklist`, ...fresh };
	},

	remove: async (event) => {
		await authenticate(event.locals.session, ['ADMIN']);
		const formData = await event.request.formData();
		const kind = formData.get('kind') as 'email' | 'name';
		const value = (formData.get('value') as string) ?? '';
		await trpc(event).blacklist.remove({ kind, value });

		const fresh = await trpc(event).blacklist.get();
		return { ok: true, message: `Removed “${value}” from ${kind} blacklist`, ...fresh };
	},
};
