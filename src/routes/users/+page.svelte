<script lang="ts">
	import UserTable from './user-table.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Statistics from './statistics.svelte';
	import saveAs from 'file-saver';
	import JSZip from 'jszip';
	import { trpc } from '$lib/trpc/client';
	import { toasts } from '$lib/stores';
	import Dropdown from '$lib/components/dropdown.svelte';

	export let data;

	$: query = Object.fromEntries($page.url.searchParams);
	let key = $page.url.searchParams.get('key') ?? 'email';
	let search = $page.url.searchParams.get('search') ?? '';
	let limit = $page.url.searchParams.get('limit') ?? '10';
	let searchFilter = $page.url.searchParams.get('searchFilter') ?? '';

	interface SearchFilter {
		search: string;
		searchFilter: string;
	}

	interface SearchValues {
		email: SearchFilter;
		role: SearchFilter;
		status: SearchFilter;
		decision: SearchFilter;
		[key: string]: SearchFilter; // Index signature to allow dynamic keys
	}

	const searchValues: SearchValues = {
		email: {
			search: '',
			searchFilter: '',
		},
		role: {
			search: '',
			searchFilter: '',
		},
		status: {
			search: '',
			searchFilter: '',
		},
		decision: {
			search: '',
			searchFilter: '',
		},
	};

	// Assuming data.questions is an array of question objects, each with a unique label of type string
	data.questions.forEach((question: { label: string }) => {
		searchValues[question.label] = {
			search: '',
			searchFilter: '',
		};
	});

	function capitalizeFirstLetter(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

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
						searchList.set(
							{ key: currentKeyValue },
							{ search: search, searchFilter: searchFilter }
						);
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

	// Function to update URL parameters
	function updateSearchFilter() {
		let searchParams = new URLSearchParams($page.url.searchParams);

		// Update or add search criteria to the URL search parameters

		// console.log(searchParams.toString())

		let searchList = returnParams(searchParams);
		searchList.forEach((value, key) => {
			if (value.searchFilter !== undefined) {
				console.log('INSIDE SEARCH FILTER');
				searchValues[key.key].search = value.search;
				searchValues[key.key].searchFilter = value.searchFilter;
			} else {
				searchValues[key.key].search = value.search;
			}
		});
	}

	// Update the search filter manually
	updateSearchFilter();

	function updateUrlParams() {
		let searchParams = new URLSearchParams();

		// Update or add search criteria to the URL search parameters
		for (const [key, value] of Object.entries(searchValues)) {
			const newKey = capitalizeFirstLetter(key);
			if (value.search) {
				searchParams.set(`key${newKey}`, key);
				if (value.searchFilter) {
					searchParams.set(`searchFilter${newKey}`, value.searchFilter);
				}

				searchParams.set(`search${newKey}`, value.search);
			} else {
				searchParams.delete(key);
			}
		}

		// Add 'limit' parameter
		searchParams.set('limit', '10');
		// Get the pathname of the current URL (the part before the ?)
		let pathname = window.location.pathname;

		// Reconstruct the URL with the updated search parameters
		let newUrl = `${pathname}?${searchParams.toString()}`;

		window.location.href = newUrl;
	}

	// Download all files of current search filter
	async function downloadAllFiles() {
		async function fetchFiles(urls: string[]) {
			async function fetchFile(url: string) {
				const r = await fetch(url);
				if (!r.ok) {
					const message = `Could not download file at ${url}: ${r.statusText}`;
					toasts.notify(message);
					throw new Error(message);
				}
				let blob = await r.blob();
				completed++;
				toasts.update(toast, `Downloading files (${completed}/${allFiles.length} completed)...`);
				return blob;
			}
			const files = await Promise.allSettled(urls.map(fetchFile));
			return files.map((file) => (file.status === 'fulfilled' ? file.value : null));
		}
		const zip = new JSZip();
		const folder = zip.folder('files') || zip;
		const allFiles = await trpc().users.files.query({ key, search, searchFilter });
		let completed = 0;
		const toast = toasts.notify(`Downloading files (0/${allFiles.length} completed)...`);
		// Download 100 files at a time to avoid overloading the server/browser
		// (Chrome will start throwing ERR_INSUFFICIENT_RESOURCES if there's too many outstanding requests,
		// and I have received errors from the database being overloaded as well)
		for (let i = 0; i < allFiles.length; i += 100) {
			const filesToDownload = allFiles.slice(i, i + 100);
			const blobs = await fetchFiles(filesToDownload.map((file) => file.url));
			for (let j = 0; j < filesToDownload.length; j++) {
				const blob = blobs[j];
				if (blob !== null) {
					folder.file(filesToDownload[j].path, blob);
				}
			}
		}
		toasts.update(toast, 'Download complete, zipping...');
		saveAs(await zip.generateAsync({ type: 'blob' }), 'files.zip');
		toasts.update(toast, 'Download complete!');
	}
</script>

<svelte:head>
	<title>Formula Hacks | Users</title>
</svelte:head>

<div class="main-content">
	<h1>Master Database</h1>
	{#if data.user.roles.includes('ADMIN')}
		<a href={'/users/download-data' + $page.url.search} download="users.csv"
			><button class="download-button"
				>Download user data (excluding file uploads) for {data.count} users as CSV</button
			></a
		>
	{/if}
	<button class="download-button" on:click={downloadAllFiles}
		>Download file uploads from {data.count} users as ZIP</button
	>

	<!-- Search filters -->
	<form data-sveltekit-keepfocus>
		<fieldset class="filter">
			<!-- Display the admin type of questions including email, role, .. -->
			<!-- enums -->

			<fieldset class="filter">
				<label for="email">Email</label>
				<input
					type="text"
					id="email"
					name="email"
					placeholder="Search email"
					autocomplete="off"
					bind:value={searchValues.email.search}
					class="search"
				/>

				<label for="role">Role</label>
				<select name="search" bind:value={searchValues.role.search} class="search">
					<option value="HACKER">HACKER</option>
					<option value="ADMIN">ADMIN</option>
					<option value="ORGANIZER">ORGANIZER</option>
					<option value="JUDGE">JUDGE</option>
					<option value="VOLUNTEER">VOLUNTEER</option>
					<option value="SPONSOR">SPONSOR</option>
				</select>

				<label for="status">Status</label>
				<select name="search" bind:value={searchValues.status.search} class="search">
					<option value="CREATED">CREATED</option>
					<option value="APPLIED">APPLIED</option>
					<option value="ACCEPTED">ACCEPTED</option>
					<option value="REJECTED">REJECTED</option>
					<option value="WAITLISTED">WAITLISTED</option>
					<option value="CONFIRMED">CONFIRMED</option>
					<option value="DECLINED">DECLINED</option>
				</select>

				<label for="decision">Decision</label>
				<select name="search" bind:value={searchValues.decision.search} class="search">
					<option value="ACCEPTED">ACCEPTED</option>
					<option value="WAITLISTED">WAITLISTED</option>
					<option value="REJECTED">REJECTED</option>
				</select>

				{#each data.questions as question}
					<label for={question.id}>{question.label}</label>
					{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
						<select
							name="searchFilter"
							class="searchFilter"
							bind:value={searchValues[question.label].searchFilter}
						>
							<option value="exact">is exactly</option>
							<option value="contains" selected>contains</option>
							<option value="unanswered">is not answered</option>
						</select>
						{#if searchFilter !== 'unanswered'}
							<input
								type="text"
								id="search"
								name="search"
								placeholder="Search"
								autocomplete="off"
								bind:value={searchValues[question.label].search}
								class="search"
							/>
						{/if}
					{:else if question.type === 'NUMBER'}
						<select
							name="searchFilter"
							class="searchFilter"
							bind:value={searchValues[question.label].searchFilter}
						>
							<option value="greater">greater than</option>
							<option value="greater_equal">greater than or equal to</option>
							<option value="less">less than</option>
							<option value="less_equal">less than or equal to</option>
							<option value="equal">equal to</option>
							<option value="not_equal">not equal to</option>
							<option value="unanswered">unanswered</option>
						</select>
						{#if searchFilter !== 'unanswered'}
							<input
								type="number"
								id="search"
								name="search"
								placeholder="Number"
								autocomplete="off"
								bind:value={searchValues[question.label].search}
								class="search"
							/>
						{/if}
					{:else if question.type === 'DROPDOWN'}
						{#if question.multiple}
							<select
								name="searchFilter"
								class="searchFilter"
								bind:value={searchValues[question.label].searchFilter}
							>
								<option value="contains">contains</option>
								<option value="exactly">is exactly</option>
								<option value="unanswered">unanswered</option>
							</select>
						{:else}
							<select
								name="searchFilter"
								class="searchFilter"
								bind:value={searchValues[question.label].searchFilter}
							>
								<option value="is" selected>is</option>
								<option value="is_not" selected>is not</option>
								<option value="unanswered">unanswered</option>
							</select>
						{/if}
						{#if searchFilter !== 'unanswered'}
							<Dropdown
								name="search"
								class="search"
								items={question.options}
								custom={Boolean(question.custom)}
								multiple={Boolean(question.multiple)}
								bind:value={searchValues[question.label].search}
								json
							/>
						{/if}
					{:else if question.type === 'CHECKBOX'}
						<select
							name="searchFilter"
							bind:value={searchValues[question.label].searchFilter}
							class="searchFilter"
						>
							<option value="true">is true</option>
							<option value="false">is false</option>
						</select>
					{:else if question.type === 'RADIO'}
						<select
							name="searchFilter"
							class="searchFilter"
							bind:value={searchValues[question.label].searchFilter}
						>
							<option value="is" selected>is</option>
							<option value="is_not" selected>is not</option>
							<option value="unanswered">unanswered</option>
						</select>
						{#if searchFilter !== 'unanswered'}
							<select name="search" bind:value={searchValues[question.label].search} class="search">
								{#each question.options as option}
									<option value={option}>{option}</option>
								{/each}
							</select>
						{/if}
					{:else if question.type === 'FILE'}
						<select
							name="searchFilter"
							bind:value={searchValues[question.label].searchFilter}
							class="searchFilter"
						>
							<option value="uploaded">has uploaded file</option>
							<option value="not_uploaded">has not uploaded file</option>
						</select>
					{/if}
				{/each}
				<input type="hidden" name="limit" value={limit} />
				<!-- <button>Search</button> -->
				<button type="button" on:click={updateUrlParams}>Search</button>
			</fieldset>
		</fieldset>
	</form>

	{#if data.users.length === 0}
		<p>No results found.</p>
	{:else}
		<Statistics questions={data.questions} count={data.count} />
		<!-- User table -->
		<div class="filter">
			<p>
				Results {data.start} through {data.start + data.users.length - 1} of {data.count}:
			</p>
			<select
				name="limit"
				bind:value={limit}
				on:change={() => {
					goto(`${location.pathname}?${new URLSearchParams({ ...query, limit })}`, {
						noScroll: true,
					});
				}}
			>
				<option value="10">Show 10</option>
				<option value="25">Show 25</option>
				<option value="50">Show 50</option>
				<option value="100">Show 100</option>
			</select>
		</div>
		<UserTable users={data.users} self={data.user} questions={data.questions} />

		<!-- Pagination -->
		<form>
			<p id="page">
				<a
					class:disabled={Number($page.url.searchParams.get('page') ?? 1) === 1}
					data-sveltekit-noscroll
					href={`?${new URLSearchParams({ ...query, page: '1' })}`}>&lt;&lt;</a
				>
				<a
					class:disabled={Number($page.url.searchParams.get('page') ?? 1) === 1}
					data-sveltekit-noscroll
					href={`?${new URLSearchParams({
						...query,
						page: String(Number($page.url.searchParams.get('page') ?? 1) - 1),
					})}`}>&lt;</a
				>
				Page
				<input
					type="number"
					name="page"
					min="1"
					max={data.pages}
					value={$page.url.searchParams.get('page') ?? 1}
				/>
				of {data.pages}
				<a
					class:disabled={Number($page.url.searchParams.get('page') ?? 1) >= data.pages}
					data-sveltekit-noscroll
					href={`?${new URLSearchParams({
						...query,
						page: String(Number($page.url.searchParams.get('page') ?? 1) + 1),
					})}`}>&gt;</a
				>
				<a
					class:disabled={Number($page.url.searchParams.get('page') ?? 1) >= data.pages}
					data-sveltekit-noscroll
					href={`?${new URLSearchParams({ ...query, page: String(data.pages) })}`}>&gt;&gt;</a
				>
			</p>
			{#each [...$page.url.searchParams] as [key, value]}
				{#if key !== 'page'}
					<input type="hidden" name={key} {value} />
				{/if}
			{/each}
		</form>
	{/if}
</div>

<style>
	.filter {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: self-start;
		gap: 0.3rem;
		width: 100%;
		min-width: 0;
		flex-wrap: wrap;
	}

	.search {
		flex: 2;
		max-width: 100%;
	}

	.searchFilter {
		flex: 1;
		max-width: 50%;
	}

	.filter button {
		min-width: 100%;
	}

	#page {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		justify-content: center;
	}

	#page input {
		width: 3.5rem;
	}

	.disabled {
		pointer-events: none;
		text-decoration: none;
		opacity: 0.5;
	}

	.download-button {
		width: 100%;
		text-align: center;
		margin-bottom: 10px;
	}
</style>
