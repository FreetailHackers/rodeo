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
		// Download 10 files at a time to avoid overloading the server/browser
		// (Chrome will start throwing ERR_INSUFFICIENT_RESOURCES if there's too many outstanding requests,
		// and I have received errors from the database being overloaded as well)
		for (let i = 0; i < allFiles.length; i += 10) {
			const filesToDownload = allFiles.slice(i, i + 10);
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
			<select
				name="key"
				class="key"
				placeholder="Choose criteria"
				bind:value={key}
				on:change={() => {
					if (key === 'role') search = 'HACKER';
					else if (key === 'status') search = 'CREATED';
					else if (key === 'decision') search = 'ACCEPTED';
					else if (Array.from(data.questions, (x) => x.id).includes(key)) {
						search = '';
						for (const question of data.questions) {
							if (
								key === question.id &&
								(question.type === 'SENTENCE' || question.type === 'PARAGRAPH')
							) {
								searchFilter = 'contains';
							} else if (
								key === question.id &&
								(question.type === 'RADIO' || (question.type === 'DROPDOWN' && !question.multiple))
							) {
								searchFilter = 'is';
							} else if (key === question.id && question.type === 'DROPDOWN') {
								searchFilter = 'contains';
							} else if (key === question.id && question.type === 'CHECKBOX') {
								searchFilter = 'true';
							} else if (key === question.id && question.type === 'FILE') {
								searchFilter = 'uploaded';
							} else if (key === question.id && question.type === 'NUMBER') {
								searchFilter = 'equal';
							}
						}
					} else if (data.settings.scanActions.includes(key)) {
						searchFilter = 'equal';
						search = '';
					} else search = '';
				}}
			>
				<!-- enums -->
				<option value="email">Email</option>
				{#if data.user.roles.includes('ADMIN')}
					<option value="role">Role</option>
					<option value="status">Status</option>
					<option value="decision">Decision</option>
				{/if}

				<optgroup label="Questions">
					{#each data.questions as question}
						<option value={question.id}>{question.label}</option>
					{/each}
				</optgroup>
				{#if data.user.roles.includes('ADMIN')}
					<optgroup label="Scan Options">
						{#each data.settings.scanActions as scanAction}
							<option value={scanAction}>{scanAction}</option>
						{/each}
					</optgroup>
				{/if}
			</select>

			{#if key === 'role'}
				<select name="search" bind:value={search} class="search">
					<option value="HACKER">HACKER</option>
					<option value="ADMIN">ADMIN</option>
					<option value="ORGANIZER">ORGANIZER</option>
					<option value="JUDGE">JUDGE</option>
					<option value="VOLUNTEER">VOLUNTEER</option>
					<option value="SPONSOR">SPONSOR</option>
				</select>
			{:else if key === 'status'}
				<select name="search" bind:value={search} class="search">
					<option value="CREATED">CREATED</option>
					<option value="APPLIED">APPLIED</option>
					<option value="ACCEPTED">ACCEPTED</option>
					<option value="REJECTED">REJECTED</option>
					<option value="WAITLISTED">WAITLISTED</option>
					<option value="CONFIRMED">CONFIRMED</option>
					<option value="DECLINED">DECLINED</option>
				</select>
			{:else if key === 'email'}
				<input
					type="text"
					id="search"
					name="search"
					placeholder="Search"
					autocomplete="off"
					bind:value={search}
					class="search"
				/>
			{:else if key === 'decision'}
				<select name="search" bind:value={search} class="search">
					<option value="ACCEPTED">ACCEPTED</option>
					<option value="WAITLISTED">WAITLISTED</option>
					<option value="REJECTED">REJECTED</option>
				</select>
			{:else if data.settings.scanActions.includes(key)}
				<select name="searchFilter" class="search" bind:value={searchFilter}>
					<option value="greater">greater than</option>
					<option value="greater_equal">greater than or equal to</option>
					<option value="less">less than</option>
					<option value="less_equal">less than or equal to</option>
					<option value="equal">equal to</option>
					<option value="not_equal">not equal to</option>
				</select>
				<input
					type="number"
					id="search"
					name="search"
					placeholder="Number"
					autocomplete="off"
					bind:value={search}
					class="search"
					min="0"
				/>
			{:else}
				{#each data.questions as question}
					{#if question.id === key}
						{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
							<select name="searchFilter" class="searchFilter" bind:value={searchFilter}>
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
									bind:value={search}
									class="search"
								/>
							{/if}
						{:else if question.type === 'NUMBER'}
							<select name="searchFilter" class="searchFilter" bind:value={searchFilter}>
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
									bind:value={search}
									class="search"
								/>
							{/if}
						{:else if question.type === 'DROPDOWN'}
							{#if question.multiple}
								<select name="searchFilter" class="searchFilter" bind:value={searchFilter}>
									<option value="contains">contains</option>
									<option value="exactly">is exactly</option>
									<option value="unanswered">unanswered</option>
								</select>
							{:else}
								<select name="searchFilter" class="searchFilter" bind:value={searchFilter}>
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
									bind:value={search}
									json
								/>
							{/if}
						{:else if question.type === 'CHECKBOX'}
							<select name="searchFilter" bind:value={searchFilter} class="searchFilter">
								<option value="true">is true</option>
								<option value="false">is false</option>
							</select>
						{:else if question.type === 'RADIO'}
							<select name="searchFilter" class="searchFilter" bind:value={searchFilter}>
								<option value="is" selected>is</option>
								<option value="is_not" selected>is not</option>
								<option value="unanswered">unanswered</option>
							</select>
							{#if searchFilter !== 'unanswered'}
								<select name="search" bind:value={search} class="search">
									{#each question.options as option}
										<option value={option}>{option}</option>
									{/each}
								</select>
							{/if}
						{:else if question.type === 'FILE'}
							<select name="searchFilter" bind:value={searchFilter} class="searchFilter">
								<option value="uploaded">has uploaded file</option>
								<option value="not_uploaded">has not uploaded file</option>
							</select>
						{/if}
					{/if}
				{/each}
			{/if}
			<input type="hidden" name="limit" value={limit} />
			<button>Search</button>
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
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 0.3rem;
		width: 100%;
		min-width: 0;
		flex-wrap: wrap;
	}

	.key {
		flex: 1;
		min-width: 50%;
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
