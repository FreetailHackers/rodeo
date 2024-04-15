import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

dayjs.extend(utc);
dayjs.extend(timezone);

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		homepageText: (await trpc(locals.auth).settings.getAll()).homepageText,
	};
};

export const actions = {
	settings: async ({ locals, request }) => {
		const homepageText = (await request.formData()).get('homepageText') as string;
		await trpc(locals.auth).settings.update({
			homepageText,
		});
		return 'Saved settings!';
	},

	createEvent: async ({ locals, request }) => {
		const timezone = (await trpc(locals.auth).settings.getPublic()).timezone;
		const formData = await request.formData();
		const fixedStartTime = dayjs.tz(formData.get('start') as string, timezone).toDate();
		const fixedEndTime = dayjs.tz(formData.get('end') as string, timezone).toDate();

		await trpc(locals.auth).events.create({
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});
		return 'Created event!';
	},

	createFAQ: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).infoBox.create({
			title: formData.get('question') as string,
			response: formData.get('answer') as string,
			category: 'FAQ',
		});
		return 'Created FAQ!';
	},

	createChallenge: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).infoBox.create({
			title: formData.get('category') as string,
			response: formData.get('challenge') as string,
			category: 'CHALLENGE',
		});
		return 'Created challenge!';
	},

	createSponsor: async ({ locals, request }) => {
		const formData = await request.formData();

		const sponsorLogo = formData.get('sponsorLogo') as File;
		const sponsorName = formData.get('sponsorName') as string;

		if (
			sponsorLogo instanceof File &&
			sponsorLogo.size !== 0 &&
			sponsorLogo.size <= 5 * 1024 * 1024
		) {
			//Remove any duplicate key image names if any
			const key = `${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;
			const deleteObjectCommand = new DeleteObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: key,
			});
			await s3Client.send(deleteObjectCommand);

			const putObjectCommand = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET,
				Key: key,
				Body: Buffer.from(await sponsorLogo.arrayBuffer()),
				ContentType: sponsorLogo.type,
			});
			await s3Client.send(putObjectCommand);

			await trpc(locals.auth).infoBox.create({
				title: sponsorName,
				response: key,
				category: 'SPONSOR',
			});
			return 'Created sponsor!';
		} else {
			return 'Error in creating sponsor! Please check file input!';
		}
	},

	deleteAll: async ({ locals, request }) => {
		const deleteAllValue = (await request.formData()).get('deleteAll') as string;

		if (deleteAllValue === 'events') {
			await trpc(locals.auth).events.deleteAll();
			return 'Deleted all Events!';
		} else if (deleteAllValue === 'FAQs') {
			await trpc(locals.auth).infoBox.deleteAllOfCategory('FAQ');
			return 'Deleted all FAQ!';
		} else if (deleteAllValue === 'challenges') {
			await trpc(locals.auth).infoBox.deleteAllOfCategory('CHALLENGE');
			return 'Deleted all challenges!';
		} else if (deleteAllValue === 'sponsors') {
			const sponsors = await trpc(locals.auth).infoBox.getAllOfCategory('SPONSOR');

			for (const sponsor of sponsors) {
				const deleteObjectCommand = new DeleteObjectCommand({
					Bucket: process.env.S3_BUCKET,
					Key: sponsor.response,
				});
				await s3Client.send(deleteObjectCommand);
			}

			await trpc(locals.auth).infoBox.deleteAllOfCategory('SPONSOR');
			return 'Deleted all sponsors!';
		} else {
			return 'Invalid element to delete';
		}
	},
};
