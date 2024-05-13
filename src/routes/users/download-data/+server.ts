import { authenticate } from '$lib/authenticate';
import { trpc } from '$lib/trpc/router';
import { Parser } from '@json2csv/plainjs';
import type { Prisma, Question } from '@prisma/client';

function returnParams(url: URLSearchParams) {
	// this has the key of key and value of dictionary for search filter and search
	const searchList = new Map();
	let search = '';
	let searchFilter = '';
	let countSearch = 0;
	let currentKeyValue = '';
	let count = 0;
	const lengthSearch = Array.from(url.keys()).length;

	// reactive values to update the search, search filter and key accordingly

	for (const [key, value] of url) {
		count += 1;

		if (key.includes('search') && !key.includes('searchFilter')) {
			search = value;
			countSearch += 1;
		} else if (key.includes('searchFilter')) {
			searchFilter = value;
			countSearch += 1;
		}

		// also at the end, adding the search and search filter to it
		// checking if the key and value is at the end of the list
		if (key.includes('key') || count === lengthSearch) {
			if (count !== 1) {
				// only search is present not search filter
				if (countSearch === 1) {
					searchList.set({ key: currentKeyValue }, { search: search });
				} else if (countSearch === 2) {
					// search and search filter is present
					searchList.set({ key: currentKeyValue }, { search: search, searchFilter: searchFilter });
				}
			}

			if (key.includes('key')) {
				currentKeyValue = value;
			}
			countSearch = 0;
		}
	}

	return searchList;
}

export const GET = async ({ locals, url }) => {
	await authenticate(locals.auth, ['ADMIN']);
	// Convert the Map to a list (array of objects)

	const searchList = returnParams(url.searchParams);

	const params = Array.from(searchList.entries()).map(([keyObj, valueObj]) => ({
		key: keyObj.keyParam,
		search: valueObj.searchParam,
		searchFilter: valueObj.searchFilterParam !== undefined ? valueObj.searchFilterParam : '', // Set default value if searchFilterParam is undefined
	}));

	const results = await trpc(locals.auth).users.search({
		page: 1,
		// key: url.searchParams.get('key') ?? '',
		// search: url.searchParams.get('search') ?? '',
		params: params,
		limit: 0,
		// searchFilter: url.searchParams.get('searchFilter') ?? '',
	});
	const questions = await trpc(locals.auth).questions.get();
	const parser = new Parser();
	const users = [];
	for (const user of results.users) {
		users.push(prepare(user, questions));
	}
	return new Response(parser.parse(users), {
		headers: {
			'Content-Type': 'text/csv',
			'Content-Disposition': 'attachment; filename="users.csv"',
		},
	});
};

// Helper function to replace question IDs with their labels
function prepare(
	user: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>,
	questions: Question[]
) {
	function prepareApplication(application: Record<string, unknown>) {
		const prepared: Record<string, unknown> = {};
		for (const question of questions) {
			prepared[question.label] = application[question.id];
		}
		return prepared;
	}
	// "Flatten" User object so CSV is generated correctly
	return {
		...user.authUser,
		...prepareApplication(user.application as Record<string, unknown>),
		decision: user.decision?.status,
		...(user.scanCount as object),
	};
}
