import { googleAuth, githubAuth } from '$lib/lucia';
import { trpc } from '$lib/trpc/router';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const load = async ({ locals }) => {
	const sponsors = await trpc(locals.auth).infoBox.getAllOfCategory('SPONSOR');

	const s3Client = new S3Client({ region: process.env.AWS_REGION });
	const sponsorLinks: Record<string, string> = {};

	await Promise.all(
		sponsors.map(async (sponsor) => {
			try {
				const url = await getSignedUrl(
					s3Client,
					new GetObjectCommand({
						Bucket: process.env.S3_BUCKET,
						Key: `${sponsor.response}`,
					})
				);

				sponsorLinks[sponsor.response] = url;
			} catch (error) {
				console.error(`Error fetching signed URL for ${sponsor.response}:`, error);
			}
		})
	);

	return {
		user: (await locals.auth.validate())?.user,
		announcements: await trpc(locals.auth).announcements.getAll(),
		schedule: await trpc(locals.auth).events.getAll(),
		settings: await trpc(locals.auth).settings.getPublic(),
		faqs: await trpc(locals.auth).infoBox.getAllOfCategory('FAQ'),
		challenges: await trpc(locals.auth).infoBox.getAllOfCategory('CHALLENGE'),
		sponsors: sponsors,
		providers: {
			google: googleAuth !== null,
			github: githubAuth !== null,
		},
		canApply: await trpc(locals.auth).admissions.canApply(),
		sponsorsLink: sponsorLinks,
	};
};

export const actions = {
	announce: async ({ locals, request }) => {
		const formData = await request.formData();
		const body = formData.get('announcement') as string;
		await trpc(locals.auth).announcements.create(body);
	},

	unannounce: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		await trpc(locals.auth).announcements.delete(Number(id));
	},
};
