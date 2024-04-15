import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { error, redirect } from '@sveltejs/kit';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

		const sponsorLogo: File | null | undefined = formData.get('sponsorLogo') as
			| File
			| null
			| undefined;
		const sponsorName: string = formData.get('sponsorName') as string;

		if (sponsorLogo && sponsorLogo?.size !== 0 && sponsorLogo?.size <= 5 * 1024 * 1024) {
			const key = sponsorLogo.name.replace(/[^\w.-]+/g, '');

			const existingSponsor = await trpc(locals.auth).infoBox.get(
				Number(formData.get('id') as string)
			);

			const deleteObjectCommand = new DeleteObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: existingSponsor?.response,
			});
			await s3Client.send(deleteObjectCommand);

			const putObjectCommand = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: key,
				Body: Buffer.from(await sponsorLogo.arrayBuffer()),
				ContentType: sponsorLogo.type,
			});
			await s3Client.send(putObjectCommand);

			await trpc(locals.auth).infoBox.update({
				id: Number(formData.get('id') as string),
				title: sponsorName,
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

		const existingSponsor = await trpc(locals.auth).infoBox.get(
			Number(formData.get('id') as string)
		);

		//Deleting uploaded image
		const deleteObjectCommand = new DeleteObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: existingSponsor?.response,
		});
		await s3Client.send(deleteObjectCommand);

		await trpc(locals.auth).infoBox.delete(Number(formData.get('id') as string));
		throw redirect(303, '/');
	},
};
