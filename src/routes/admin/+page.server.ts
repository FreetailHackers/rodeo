import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { Prisma } from '@prisma/client';

dayjs.extend(utc);
dayjs.extend(timezone);

// export const load = async ({ locals }) => {
// 	await authenticate(locals.auth, ['ADMIN']);
// 	return {
// 		decisions: await trpc(locals.auth).admissions.getDecisions(),
// 		settings: await trpc(locals.auth).settings.getAll(),
// 		graph: await trpc(locals.auth).users.getStatusChanges(),
// 	};
// };

export const load = async ({ locals }) => {
	await authenticate(locals.auth, ['ADMIN']);

	// Fetch users, settings, decisions, and graph data
	const [users, settings, decisions, graph] = await Promise.all([
		trpc(locals.auth).users.get(), // Ensure this fetches all users
		trpc(locals.auth).settings.getAll(),
		trpc(locals.auth).admissions.getDecisions(),
		trpc(locals.auth).users.getStatusChanges(),
	]);

	// Ensure users is an array
	const usersArray = Array.isArray(users) ? users : users ? [users] : [];

	// Ensure blacklist is an array
	const blacklist = Array.isArray(settings.blacklist) ? settings.blacklist : [];

	// Map users and check if they are blacklisted
	const usersWithBlacklist = usersArray.map(
		(user: Prisma.UserGetPayload<{ include: { authUser: true } }>) => ({
			...user,
			isBlacklisted: blacklist.includes(user.authUser?.email ?? ''),
		})
	);

	return {
		users: usersWithBlacklist, // Pass users with blacklist info
		decisions,
		settings,
		graph,
	};
};

const parseDateWithTimezone = (dateString: string | null, timezone: string): Date | null => {
	try {
		return dateString ? dayjs.tz(dateString, timezone).toDate() : null;
	} catch (e) {
		return null;
	}
};

export const actions = {
	settings: async ({ locals, request }) => {
		const formData = await request.formData();
		//const timezone = formData.get('timezone') as string;
		const timezone = (formData.get('timezone') as string | null) || 'UTC';

		const applicationDeadline = parseDateWithTimezone(
			formData.get('applicationDeadline') as string,
			timezone
		);
		const hackathonStartDate = parseDateWithTimezone(
			formData.get('hackathonStartDate') as string,
			timezone
		);

		const applicationLimitRaw = formData.get('applicationLimit');
		let applicationLimit: number | null = parseInt(applicationLimitRaw as string);
		if (isNaN(applicationLimit)) {
			applicationLimit = null;
		}
		const applicationOpen = formData.get('applicationOpen') === 'on';
		const parsedDaysToRSVP = parseInt(formData.get('daysToRSVP') as string, 10);
		const daysToRSVP: number | null = isNaN(parsedDaysToRSVP) ? null : parsedDaysToRSVP;

		// const scanActions = (formData.get('scanActions') as string)
		// 	.split('\r\n')
		// 	.map((option: string) => option.trim())
		// 	.filter(Boolean);

		const rawScanActions = formData.get('scanActions');
		const scanActions =
			rawScanActions && typeof rawScanActions === 'string'
				? rawScanActions
						.split('\r\n')
						.map((option) => option.trim())
						.filter(Boolean)
				: [];

		// Handle Blacklist Addition
		const newBlacklistEmail = formData.get('newBlacklistEmail') as string;
		const settings = await trpc(locals.auth).settings.getAll();
		const blacklist = settings.blacklist || [];

		// Add email to blacklist if it is not already present
		if (newBlacklistEmail && !blacklist.includes(newBlacklistEmail)) {
			blacklist.push(newBlacklistEmail);
		}

		await trpc(locals.auth).settings.update({
			applicationOpen,
			daysToRSVP,
			scanActions,
			timezone,
			applicationDeadline,
			applicationLimit,
			hackathonStartDate,
			blacklist,
		});
		return 'Saved settings!';
	},

	release: async ({ locals }) => {
		await trpc(locals.auth).admissions.releaseAllDecisions();
		return 'Released all decisions!';
	},

	splitGroups: async ({ locals, request }) => {
		const formData = await request.formData();
		const numGroups = parseInt(formData.get('splitGroups') as string, 10);
		await trpc(locals.auth).users.splitGroups(numGroups);
		return 'Groups successfully split and updated!';
	},
};
