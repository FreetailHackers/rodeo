import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { s3Delete, s3Upload } from '$lib/s3Handler';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);
	return {
		settings: await trpc(locals.auth).settings.getPublic(),
		challenges: await trpc(locals.auth).prizeBox.getAll(),
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

		const startDate = formData.get('start') as string | null;
		const endDate = formData.get('end') as string | null;

		let startTimeInTimezone: Date | null = null;
		let endTimeInTimezone: Date | null = null;
		if (startDate) {
			startTimeInTimezone = dayjs.tz(startDate, timezone).toDate();
		}
		if (endDate) {
			endTimeInTimezone = dayjs.tz(endDate, timezone).toDate();
		}
		if (!startTimeInTimezone && !endTimeInTimezone) {
			return 'ERROR: Either start or end date must be provided.';
		}

		await trpc(locals.auth).events.create({
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: startTimeInTimezone,
			end: endTimeInTimezone,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		});

		return 'Created event!';
	},

	createFAQ: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).faq.create({
			question: formData.get('question') as string,
			answer: formData.get('answer') as string,
		});
		return 'Created FAQ!';
	},

	createChallenge: async ({ locals, request }) => {
		const formData = await request.formData();

		await trpc(locals.auth).prizeBox.create({
			title: formData.get('category') as string,
			description: formData.get('challenge') as string,
			prizeType: 'CHALLENGE',
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

			s3Upload(key, sponsorLogo);

			await trpc(locals.auth).prizeBox.create({
				title: key,
				description: sponsorLink,
				prizeType: 'SPONSOR',
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
			await trpc(locals.auth).faq.deleteAll();
			return 'Deleted all FAQ!';
		} else if (deleteAllValue === 'challenges') {
			await trpc(locals.auth).prizeBox.deleteAllOfCategory('CHALLENGE');
			await trpc(locals.auth).prizeBox.deleteAllOfCategory('FIRST');
			await trpc(locals.auth).prizeBox.deleteAllOfCategory('SECOND');
			await trpc(locals.auth).prizeBox.deleteAllOfCategory('THIRD');
			return 'Deleted all challenges!';
		} else if (deleteAllValue === 'sponsors') {
			const sponsors = await trpc(locals.auth).prizeBox.getAllOfCategory('SPONSOR');

			for (const sponsor of sponsors) {
				s3Delete(sponsor.title);
			}

			await trpc(locals.auth).prizeBox.deleteAllOfCategory('SPONSOR');
			return 'Deleted all sponsors!';
		} else {
			return 'Invalid element to delete';
		}
	},
};
