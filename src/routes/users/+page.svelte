<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { Parser } from '@json2csv/plainjs';
	import UserTable from './user-table.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Plot from 'svelte-plotly.js';
	import JSZip from 'jszip';
	import { saveAs } from 'file-saver';
	import { page } from '$app/stores';
	import { toasts } from '$lib/stores';

	export let data;

	$: query = Object.fromEntries($page.url.searchParams);
	let key = $page.url.searchParams.get('key') ?? 'email';
	let search = $page.url.searchParams.get('search') ?? '';
	let limit = $page.url.searchParams.get('limit') ?? '10';

	// Helper function to replace question IDs with their labels
	function prepare(user: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>) {
		function prepareApplication(application: Record<string, unknown>) {
			let prepared: Record<string, unknown> = {};
			for (const question of data.questions) {
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

	let csvDownloadLink: string;
	$: if (browser && data.users.length > 0) {
		const parser = new Parser();
		const csv = parser.parse(data.users.map(prepare));
		csvDownloadLink = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
	}

	function downloadCSV() {
		const parser = new Parser();
		const csv = parser.parse(data.users.map(prepare));
		const blob = new Blob([csv], { type: 'text/csv' });
		saveAs(blob, 'users.csv');
	}

	function recordToDataObject(answerData: Record<string, number>) {
		const labels = Object.keys(answerData);
		const values = labels.map((label) => answerData[label]);
		return {
			labels: labels,
			values: values,
			type: 'pie' as const,
			textinfo: 'none' as const,
		};
	}

	// Download all files of current search filter
	function downloadAllFiles() {
		const zip = new JSZip();
		const folder = zip.folder('files') || zip;
		data.users.forEach((user) => {
			const application = user.application as Record<string, unknown>;
			data.questions.forEach((question) => {
				if (application[question.id] !== undefined && application[question.id] !== '') {
					if (question.type === 'FILE') {
						folder.file(
							`${user.authUser.email}/${application[question.id]}`,
							fetchFile(`/files/${user.authUserId}/${question.id}`)
						);
					}
				}
			});
		});
		zip.generateAsync({ type: 'blob' }).then(function (content) {
			saveAs(content, 'files.zip');
		});
	}

	async function fetchFile(fileUrl: string) {
		try {
			const response = await fetch(fileUrl);
			if (!response.ok) {
				toasts.notify('Network response was not ok; unable to download ' + fileUrl);
				throw new Error('Network response was not ok');
			}
			return await response.blob();
		} catch (error) {
			toasts.notify('Error downloading file');
			throw error;
		}
	}
</script>

<svelte:head>
	<title>Rodeo | Users</title>
</svelte:head>
<h1>Master Database</h1>
<button class="download-button" on:click={downloadCSV}>Export search results as CSV</button>
<button class="download-button" on:click={downloadAllFiles}>Download files selected users</button>

<!-- Search filters -->
<form>
	<fieldset class="filter">
		<select
			name="key"
			bind:value={key}
			on:change={() => {
				if (key === 'role') search = 'HACKER';
				else if (key === 'status') search = 'CREATED';
				else search = '';
			}}
		>
			<option value="email">Email</option>
			<option value="role">Role</option>
			<option value="status">Status</option>
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
				<option value="VERIFIED">VERIFIED</option>
				<option value="APPLIED">APPLIED</option>
				<option value="ACCEPTED">ACCEPTED</option>
				<option value="REJECTED">REJECTED</option>
				<option value="WAITLISTED">WAITLISTED</option>
				<option value="CONFIRMED">CONFIRMED</option>
				<option value="DECLINED">DECLINED</option>
			</select>
		{:else}
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
		<input type="hidden" name="limit" value={limit} />
		<button>Search</button>
	</fieldset>
</form>

{#if data.users.length === 0}
	<p>No results found.</p>
{:else}
	<!-- User Statistics -->
	<details class="stats">
		<summary>User Statistics</summary>
		{#each data.questions as question}
			{#if data.stats[question.id] !== undefined}
				<h2>{question.label}</h2>
				<div class="graph-container">
					<Plot
						data={[recordToDataObject(data.stats[question.id])]}
						layout={{
							showlegend: true,
							legend: {
								orientation: 'h',
							},
							margin: {
								t: 50,
								r: 50,
								b: 50,
								l: 50,
							},
						}}
						fillParent="width"
						debounce={250}
					/>
				</div>
			{/if}
		{/each}
	</details>

	<!-- User table -->
	<div class="filter">
		<p>
			Results {data.start} through {data.start + data.users.length - 1} of {data.count}:
		</p>
		<select
			name="limit"
			bind:value={limit}
			on:change={() => {
				goto(`${location.pathname}?${new URLSearchParams({ ...$page.url.searchParams, limit })}`, {
					noScroll: true,
				});
			}}
		>
			<option value="10">Show 10</option>
			<option value="25">Show 25</option>
			<option value="50">Show 50</option>
			<option value="100">Show 100</option>
			<option value="0">Show all</option>
		</select>
	</div>
	<UserTable users={data.users} selfID={data.user.id} questions={data.questions} />

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

<style>
	.stats {
		padding-top: 20px;
	}
	.filter {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-width: 0;
	}

	.search {
		min-width: 0;
		flex: 1;
	}

	.filter button {
		min-width: 5rem;
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

	.graph-container {
		width: 100%;
		height: 300px;
		overflow: hidden;
	}

	.download-button {
		width: 100%;
		text-align: center;
		margin-bottom: 10px;
	}
</style>
