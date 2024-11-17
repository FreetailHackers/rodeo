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
		events: await trpc(locals.auth).events.getAll(),
		faqs: await trpc(locals.auth).faq.getAll(),
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

	// Sponsor Functions
	createSponsor: async ({ locals, request }) => {
		const formData = await request.formData();

		const sponsorLogo = formData.get('sponsorLogo') as File;
		const sponsorLink = formData.get('sponsorLink') as string;

		if (sponsorLogo instanceof File && sponsorLogo.size !== 0 && sponsorLogo.size <= 1024 * 1024) {
			// Removes all characters that are not alphanumeric, periods, or hyphens
			const key = `sponsors/${sponsorLogo.name.replace(/[^\w.-]+/g, '')}`;

			s3Upload(key, sponsorLogo);

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
				s3Delete(sponsor.title);
			}

			await trpc(locals.auth).infoBox.deleteAllOfCategory('SPONSOR');
			return 'Deleted all sponsors!';
		} else {
			return 'Invalid element to delete';
		}
	},
};
