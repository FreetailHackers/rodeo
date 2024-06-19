import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';
import { s3UploadHandler } from '$lib/s3UploadHandler';
import { s3DeleteHandler } from '$lib/s3DeleteHandler';

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.specificSponsor))) {
		throw error(404, 'Sponsor not found');
	}
	const sponsor = await trpc(locals.auth).infoBox.get(Number(params.specificSponsor));
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

			const existingSponsor = await trpc(locals.auth).infoBox.get(
				Number(formData.get('id') as string)
			);

			// If no file was specified, use pre existing logo
			if (sponsorLogo?.size === 0 && existingSponsor) {
				key = existingSponsor.title;
			} else {
				// Deleting previous logo
				s3DeleteHandler(existingSponsor?.title);
				// Replace all characters that are not alphanumeric, periods, or hyphens with an empty string
				key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;
				// Uploading new logo
				s3UploadHandler(key, sponsorLogo);
			}

			await trpc(locals.auth).infoBox.update({
				id: Number(formData.get('id') as string),
				title: key,
				response: sponsorLink,
				category: 'SPONSOR',
			});
			return 'Saved sponsor!';
		} else {
			return 'Error in updating sponsor! Check your file!';
		}
	},

	delete: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id') as string);

		const existingSponsor = await trpc(locals.auth).infoBox.get(id);

		// Deleting uploaded image
		s3DeleteHandler(existingSponsor?.title);

		await trpc(locals.auth).infoBox.delete(id);
		throw redirect(303, '/');
	},
};
