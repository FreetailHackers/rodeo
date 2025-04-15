import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { s3Upload } from '$lib/s3Handler';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);

	return {
		settings: await trpc(locals.auth).settings.getPublic(),
		events: await trpc(locals.auth).events.getAll(),
		faqs: await trpc(locals.auth).faq.getAll(),
		challenges: await trpc(locals.auth).challenges.getAll(),
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

	setHomepageURL: async ({ locals, request }) => {
		const formData = await request.formData();
		const homepageURL = formData.get('homepageURL') as string;

		await trpc(locals.auth).settings.update({
			homepageURL,
		});

		return 'Updated Homepage URL!';
	},

	handleEvent: async ({ locals, request }) => {
		const timezone = (await trpc(locals.auth).settings.getPublic()).timezone;
		const formData = await request.formData();

		const id = formData.get('id'); // Check for id to determine create or update
		const start = formData.get('start') as string;
		const end = formData.get('end') as string;
		const fixedStartTime = start ? dayjs.tz(start, timezone).toDate() : null;
		const fixedEndTime = end ? dayjs.tz(end, timezone).toDate() : null;

		const eventData = {
			name: formData.get('name') as string,
			description: formData.get('description') as string,
			start: fixedStartTime,
			end: fixedEndTime,
			location: formData.get('location') as string,
			type: formData.get('type') as string,
		};

		if (id) {
			// Update existing event
			await trpc(locals.auth).events.update({
				id: Number(id),
				...eventData,
			});
			return 'Saved event!';
		} else {
			// Create new event
			await trpc(locals.auth).events.create(eventData);
			return 'Created event!';
		}
	},

	deleteEvent: async ({ locals, request }) => {
		const eventId = parseInt((await request.formData()).get('id') as string, 10);
		if (isNaN(eventId)) {
			throw new Error('Invalid event ID');
		}
		await trpc(locals.auth).events.delete(eventId);
		return 'Deleted event!';
	},

	deleteAllEvents: async ({ locals }) => {
		await trpc(locals.auth).events.deleteAll();
		return 'Deleted all events!';
	},

	// FAQ Functions
	handleFAQ: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id'); // Check for id to determine create or update
		const question = formData.get('question') as string;
		const answer = formData.get('answer') as string;

		const FAQData = {
			question: question,
			answer: answer,
		};

		if (id) {
			await trpc(locals.auth).faq.update({
				id: Number(id),
				...FAQData,
			});
			return 'Saved FAQ!';
		} else {
			await trpc(locals.auth).faq.create(FAQData);
			return 'Created FAQ!';
		}
	},

	deleteFAQ: async ({ locals, request }) => {
		const id = parseInt((await request.formData()).get('id') as string, 10);
		if (isNaN(id)) {
			throw new Error('Invalid FAQ ID');
		}
		await trpc(locals.auth).faq.delete(id);
		return 'Deleted FAQ!';
	},

	deleteAllFAQs: async ({ locals }) => {
		await trpc(locals.auth).faq.deleteAll();
		return 'Deleted all FAQ!';
	},

	// Challenge Functions
	handleChallenge: async ({ locals, request }) => {
		const formData = await request.formData();
		const id = formData.get('id'); // Check for id to determine create or update
		const title = formData.get('title') as string;
		const prize = formData.get('prize') as string;
		const description = formData.get('description') as string;

		const challengeData = {
			title: title,
			prize: prize,
			description: description,
		};

		if (id) {
			await trpc(locals.auth).challenges.update({
				id: Number(id),
				...challengeData,
			});
			return 'Saved challenge!';
		} else {
			await trpc(locals.auth).challenges.create(challengeData);
			return 'Created challenge!';
		}
	},

	deleteChallenge: async ({ locals, request }) => {
		const id = parseInt((await request.formData()).get('id') as string, 10);
		if (isNaN(id)) {
			throw new Error('Invalid challenge ID');
		}
		await trpc(locals.auth).challenges.delete(id);
		return 'Deleted challenge!';
	},

	deleteAllChallenges: async ({ locals }) => {
		await trpc(locals.auth).challenges.deleteAll();
		return 'Deleted all challenges!';
	},

	// Sponsor Functions
	createSponsor: async ({ locals, request }) => {
		const formData = await request.formData();

		const sponsorLogo = formData.get('sponsorLogo') as File;
		const sponsorLink = formData.get('sponsorLink') as string;

		if (sponsorLogo instanceof File && sponsorLogo.size !== 0 && sponsorLogo.size <= 1024 * 1024) {
			// Removes all characters that are not alphanumeric, periods, or hyphens
			const key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;

			s3Upload(key, sponsorLogo);

			await trpc(locals.auth).sponsors.create({
				name: formData.get('sponsorName') as string,
				imageKey: key,
				url: sponsorLink,
			});

			return 'Created sponsor!';
		} else {
			return 'Error in creating sponsor! Please check file input!';
		}
	},
};
