import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';
import { s3Delete, s3Upload } from '$lib/s3Handler';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.specificSponsor))) {
		throw error(404, 'Sponsor not found');
	}
	const sponsor = await trpc(locals.auth).prizeBox.get(Number(params.specificSponsor));
	if (sponsor !== null) {
		return sponsor;
	}
	throw error(404, 'Sponsor not found');
};

export const actions = {
	edit: async ({ locals, request }) => {
		const formData = await request.formData();

		const sponsorLogo = formData.get('sponsorLogo') as File;
		const sponsorLink = formData.get('sponsorLink') as string;

		if (sponsorLogo && sponsorLogo.size <= 1024 * 1024) {
			let key: string = '';

			const existingSponsor = await trpc(locals.auth).prizeBox.get(
				Number(formData.get('id') as string)
			);

			// If no file was specified, use pre existing logo
			if (sponsorLogo?.size === 0 && existingSponsor) {
				key = existingSponsor.title;
			} else {
				// Deleting previous logo
				s3Delete(existingSponsor?.title);
				// Removes all characters that are not alphanumeric, periods, or hyphens
				key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;
				// Uploading new logo
				s3Upload(key, sponsorLogo);
			}

			await trpc(locals.auth).prizeBox.update({
				id: Number(formData.get('id') as string),
				title: key,
				description: sponsorLink,
				prizeType: 'SPONSOR',
			});
			return 'Saved sponsor!';
		} else {
			return 'Error in updating sponsor! Check your file!';
		}
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id') as string);

		const existingSponsor = await trpc(locals.auth).prizeBox.get(id);

		// Deleting uploaded image
		s3Delete(existingSponsor?.title);

		await trpc(locals.auth).prizeBox.delete(id);
		throw redirect(303, '/');
	},
};
