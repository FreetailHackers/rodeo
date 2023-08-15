import { authenticate } from '$lib/authenticate.js';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { redirect } from '@sveltejs/kit';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const GET = async ({ params, locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	const url = await getSignedUrl(
		s3Client,
		new GetObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: `${params.user}/${params.question}`,
		})
	);
	throw redirect(302, url);
};
