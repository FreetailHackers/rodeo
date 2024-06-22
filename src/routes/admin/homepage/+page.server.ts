import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { s3UploadHandler } from '$lib/s3UploadHandler';
import { s3DeleteHandler } from '$lib/s3DeleteHandler';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		settings: await trpc(locals.auth).settings.getPublic(),
	};
};

export const actions = {
	settings: async ({ locals, request }) => {
		const homepageText = (await request.formData()).get('homepageText') as string;
		await trpc(locals.auth).settings.update({
			homepageText,
		});
		return 'Saved homepage text!';
	},

	showSections: async ({ locals, request }) => {
		const formData = await request.formData();
		const showAnnouncements = formData.get('showAnnouncements') === 'on';
		const showSchedule = formData.get('showSchedule') === 'on';
		const showFAQ = formData.get('showFAQ') === 'on';
		const showChallenges = formData.get('showChallenges') === 'on';
		const showSponsors = formData.get('showSponsors') === 'on';
		await trpc(locals.auth).settings.update({
			showAnnouncements,
			showSchedule,
			showFAQ,
			showChallenges,
			showSponsors,
		});
		return 'Saved displayed sections!';
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
		const sponsorLink = formData.get('sponsorLink') as string;

		if (sponsorLogo instanceof File && sponsorLogo.size !== 0 && sponsorLogo.size <= 1024 * 1024) {
			// Removes all characters that are not alphanumeric, periods, or hyphens
			const key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;

			s3UploadHandler(key, sponsorLogo);

			await trpc(locals.auth).infoBox.create({
				title: key,
				response: sponsorLink,
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
				s3DeleteHandler(sponsor.title);
			}

			await trpc(locals.auth).infoBox.deleteAllOfCategory('SPONSOR');
			return 'Deleted all sponsors!';
		} else {
			return 'Invalid element to delete';
		}
	},
};
