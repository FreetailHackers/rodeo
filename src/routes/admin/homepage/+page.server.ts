import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { s3Upload } from '$lib/s3Handler';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const load = async (event) => {
	await authenticate(event.locals.session, ['ADMIN']);
	return {
		settings: await trpc(event).settings.getPublic(),
		events: await trpc(event).events.getAll(),
		faqs: await trpc(event).faq.getAll(),
		challenges: await trpc(event).challenges.getAll(),
	};
};

export const actions = {
	settings: async (event) => {
		const homepageText = (await event.request.formData()).get('homepageText') as string;
		await trpc(event).settings.update({
			homepageText,
		});
		return 'Saved homepage text!';
	},

	showSections: async (event) => {
		const formData = await event.request.formData();
		const showAnnouncements = formData.get('showAnnouncements') === 'on';
		const showSchedule = formData.get('showSchedule') === 'on';
		const showFAQ = formData.get('showFAQ') === 'on';
		const showChallenges = formData.get('showChallenges') === 'on';
		const showSponsors = formData.get('showSponsors') === 'on';
		await trpc(event).settings.update({
			showAnnouncements,
			showSchedule,
			showFAQ,
			showChallenges,
			showSponsors,
		});
		return 'Saved displayed sections!';
	},

	handleEvent: async (event) => {
		const timezone = (await trpc(event).settings.getPublic()).timezone;
		const formData = await event.request.formData();

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
			await trpc(event).events.update({
				id: Number(id),
				...eventData,
			});
			return 'Saved event!';
		} else {
			// Create new event
			await trpc(event).events.create(eventData);
			return 'Created event!';
		}
	},

	deleteEvent: async (event) => {
		const eventId = parseInt((await event.request.formData()).get('id') as string, 10);
		if (isNaN(eventId)) {
			throw new Error('Invalid event ID');
		}
		await trpc(event).events.delete(eventId);
		return 'Deleted event!';
	},

	deleteAllEvents: async (event) => {
		await trpc(event).events.deleteAll();
		return 'Deleted all events!';
	},

	// FAQ Functions
	handleFAQ: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('id'); // Check for id to determine create or update
		const question = formData.get('question') as string;
		const answer = formData.get('answer') as string;

		const FAQData = {
			question: question,
			answer: answer,
		};

		if (id) {
			await trpc(event).faq.update({
				id: Number(id),
				...FAQData,
			});
			return 'Saved FAQ!';
		} else {
			await trpc(event).faq.create(FAQData);
			return 'Created FAQ!';
		}
	},

	deleteFAQ: async (event) => {
		const id = parseInt((await event.request.formData()).get('id') as string, 10);
		if (isNaN(id)) {
			throw new Error('Invalid FAQ ID');
		}
		await trpc(event).faq.delete(id);
		return 'Deleted FAQ!';
	},

	deleteAllFAQs: async (event) => {
		await trpc(event).faq.deleteAll();
		return 'Deleted all FAQ!';
	},

	// Challenge Functions
	handleChallenge: async (event) => {
		const formData = await event.request.formData();
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
			await trpc(event).challenges.update({
				id: Number(id),
				...challengeData,
			});
			return 'Saved challenge!';
		} else {
			await trpc(event).challenges.create(challengeData);
			return 'Created challenge!';
		}
	},

	deleteChallenge: async (event) => {
		const id = parseInt((await event.request.formData()).get('id') as string, 10);
		if (isNaN(id)) {
			throw new Error('Invalid challenge ID');
		}
		await trpc(event).challenges.delete(id);
		return 'Deleted challenge!';
	},

	deleteAllChallenges: async (event) => {
		await trpc(event).challenges.deleteAll();
		return 'Deleted all challenges!';
	},

	// Sponsor Functions
	createSponsor: async (event) => {
		const formData = await event.request.formData();

		const sponsorLogo = formData.get('sponsorLogo') as File;
		const sponsorLink = formData.get('sponsorLink') as string;

		if (sponsorLogo instanceof File && sponsorLogo.size !== 0 && sponsorLogo.size <= 1024 * 1024) {
			// Removes all characters that are not alphanumeric, periods, or hyphens
			const key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;

			s3Upload(key, sponsorLogo);

			await trpc(event).sponsors.create({
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
