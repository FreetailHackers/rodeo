import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';
import { s3UploadHandler } from '$lib/s3UploadHandler';
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const load = async ({ locals, params }) => {
	await authenticate(locals.auth, ['ADMIN']);
	if (Number.isNaN(Number(params.specificSponsor))) {
		throw error(404, 'Sponsor not found');
	}
	const sponsor = await trpc(locals.auth).infoBox.get(Number(params.specificSponsor));
	if (sponsor !== null) {
		return {
			sponsor,
		};
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
				key = existingSponsor.response;
			} else {
				// Deleting previous logo
				const deleteObjectCommand = new DeleteObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: existingSponsor?.response,
				});
				await s3Client.send(deleteObjectCommand);
				// Uploading new logo
				key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;
				s3UploadHandler(key, sponsorLogo);
			}

			await trpc(locals.auth).infoBox.update({
				id: Number(formData.get('id') as string),
				title: sponsorLink,
				response: key,
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
		const deleteObjectCommand = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: existingSponsor?.response,
		});
		await s3Client.send(deleteObjectCommand);

		await trpc(locals.auth).infoBox.delete(id);
		throw redirect(303, '/');
	},
};
