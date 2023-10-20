import { authenticate } from '$lib/authenticate.js';
import { getQuestions } from '$lib/trpc/routes/questions.js';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { redirect } from '@sveltejs/kit';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const GET = async ({ params, locals }) => {
	const user = await authenticate(locals.auth, ['ADMIN', 'SPONSOR']);
	const questions = await getQuestions();
	if (
		!user.roles.includes('ADMIN') &&
		!questions.filter((question) => question.id === params.question)[0].sponsorView
	) {
		throw redirect(303, '/?forbidden');
	}
	const url = await getSignedUrl(
		s3Client,
		new GetObjectCommand({
			Bucket: process.env.S3_BUCKET,
			Key: `${params.user}/${params.question}`,
		})
	);
	throw redirect(302, url);
};
