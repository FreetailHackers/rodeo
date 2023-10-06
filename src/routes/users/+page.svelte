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
	import Select from 'svelte-select';
	import { toasts } from '$lib/stores';

	export let data;

	const dropdownFilterTexts: Record<string, string> = {};

	$: query = Object.fromEntries($page.url.searchParams);
	let key = $page.url.searchParams.get('key') ?? 'email';
	let search = $page.url.searchParams.get('search') ?? '';
	let limit = $page.url.searchParams.get('limit') ?? '10';
	let searchFilter = $page.url.searchParams.get('searchFilter') ?? '';

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

	function recordToNumberObject(answerData: Record<string, number>) {
		const data = Object.entries(answerData).flatMap(([label, value]) => {
			const numericLabel = parseFloat(label);
			return Array.from({ length: value }, () => numericLabel);
		});

		return {
			type: 'box' as const,
			boxpoints: false as false,
			y: data,
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
				throw new Error();
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
<button class="download-button" on:click={downloadAllFiles}
	>Download files from current search</button
>

<!-- Search filters -->
<form>
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
			<option value="role">Role</option>
			<option value="status">Status</option>
			<option value="decision">Decision</option>

			<optgroup label="Questions">
				{#each data.questions as question}
					<option value={question.id}>{question.label}</option>
				{/each}
			</optgroup>
			<optgroup label="Scan Options">
				{#each data.settings.scanActions as scanOption}
					<option value={scanOption}>{scanOption}</option>
				{/each}
			</optgroup>
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
							<Select
								name="search"
								class="search"
								items={question.custom && dropdownFilterTexts[question.id]
									? [...new Set([...question.options, dropdownFilterTexts[question.id]])]
									: question.options}
								bind:filterText={dropdownFilterTexts[question.id]}
								bind:value={search}
								multiple={Boolean(question.multiple)}
								containerStyles="border: 2px solid gray; border-radius: 0; margin-top: 0px; min-height: 2.5rem; min-width: 60%"
								inputStyles="margin: 0; height: initial"
							>
								<div slot="item" let:item>
									{question.options.includes(item.label) ? '' : 'Other: '}
									{item.label}
								</div>
							</Select>
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
	<!-- User Statistics -->
	<details class="stats">
		<summary>User Statistics</summary>
		{#if Object.keys(data.stats).length === 0}
			<p>No statistics available.</p>
		{/if}
		{#each data.questions as question}
			{#if data.stats[question.id] !== undefined}
				<h2>{question.label}</h2>
				{#if question.type === 'NUMBER'}
					<Plot
						data={[recordToNumberObject(data.stats[question.id])]}
						layout={{
							showlegend: false,
							margin: {
								t: 20,
								r: 50,
								b: 50,
								l: 20,
							},
						}}
						fillParent="width"
						debounce={250}
					/>
				{:else}
					<div class="graph-container">
						<Plot
							data={[recordToDataObject(data.stats[question.id])]}
							layout={{
								showlegend: true,
								legend: {
									orientation: 'h',
								},
								margin: {
									t: 20,
									r: 50,
									b: 50,
									l: 20,
								},
							}}
							fillParent={true}
							debounce={250}
						/>
					</div>
				{/if}
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

<style>
	.stats {
		padding-top: 20px;
	}

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
