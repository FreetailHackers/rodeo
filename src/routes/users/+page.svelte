<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { Parser } from '@json2csv/plainjs';
	import UserTable from './user-table.svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Plot from 'svelte-plotly.js';

	export let data;

	let key = data.query.key ?? '';
	let search = data.query.search ?? '';
	let limit = data.query.limit ?? '10';
	let questions = data.questions;
	let filter = data.query.filter ?? '';
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
</script>

<svelte:head>
	<title>Rodeo | Users</title>
</svelte:head>
<h1>Master Database</h1>
<p><a href={csvDownloadLink} download="users.csv">Export search results as CSV</a></p>

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
			<optgroup label="Enums">
				<option value="email">Email</option>
				<option value="role">Role</option>
				<option value="status">Status</option>
				<option value="decision">Decision</option>
			</optgroup>
			<optgroup label="Questions">
				{#each questions as question}
					<option value={question.id}>{question.label}</option>
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
		{:else if key == 'email'}
			<input
				type="text"
				id="search"
				name="search"
				placeholder="Search"
				autocomplete="off"
				bind:value={search}
				class="search"
			/>
		{:else if key == 'decision'}
			<select name="search" bind:value={search} class="search">
				<option value="ACCEPTED">ACCEPTED</option>
				<option value="WAITLISTED">WAITLISTED</option>
				<option value="REJECTED">REJECTED</option>
			</select>
		{:else}
			{#each questions as question}
				{#if question.id == key}
					{#if question.type == 'CHECKBOX'}
						<select name="search" bind:value={search} class="search">
							<option value="TRUE">TRUE</option>
							<option value="FALSE">FALSE</option>
						</select>
					{:else if question.type == 'SENTENCE' || question.type == 'PARAGRAPH'}
						<select name="filter" class="search">
							<option value="exact">is exactly</option>
							<option value="contains">contains</option>
							<option value="regex">matches regex</option>
						</select>
						<input
							type="text"
							id="search"
							name="search"
							placeholder="Search"
							autocomplete="off"
							bind:value={search}
							class="search"
						/>
					{:else if question.type == 'NUMBER'}
						<select name="filter" class="search" bind:value={filter}>
							<option value="greater">greater than</option>
							<option value="greater_equal">greater than or equal to</option>
							<option value="less">less than</option>
							<option value="less_equal">less than or equal to</option>
							<option value="equal">equal to</option>
							<option value="not_equal_to">not equal to</option>
							<option value="not_answered">not equal to</option>
						</select>
						{#if filter != 'not_answered'}
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
					{:else if question.type == 'DROPDOWN'}
						<select name="search" bind:value={search} class="search">
							{#each question.options as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					{:else if question.type == 'RADIO'}
						<select name="search" bind:value={search} class="search">
							{#each question.options as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
					{:else if question.type == 'FILE'}
						<select name="search" bind:value={search} class="search">
							<option value="uploaded">Uploaded File</option>
							<option value="not_uploaded">Not Uploaded File</option>
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
				goto(`${location.pathname}?${new URLSearchParams({ ...data.query, limit })}`, {
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
				class:disabled={Number(data.query.page ?? 1) === 1}
				data-sveltekit-noscroll
				href={`?${new URLSearchParams({ ...data.query, page: '1' })}`}>&lt;&lt;</a
			>
			<a
				class:disabled={Number(data.query.page ?? 1) === 1}
				data-sveltekit-noscroll
				href={`?${new URLSearchParams({
					...data.query,
					page: String(Number(data.query.page ?? 1) - 1),
				})}`}>&lt;</a
			>
			Page <input type="number" name="page" min="1" max={data.pages} value={data.query.page ?? 1} />
			of {data.pages}
			<a
				class:disabled={Number(data.query.page ?? 1) >= data.pages}
				data-sveltekit-noscroll
				href={`?${new URLSearchParams({
					...data.query,
					page: String(Number(data.query.page ?? 1) + 1),
				})}`}>&gt;</a
			>
			<a
				class:disabled={Number(data.query.page ?? 1) >= data.pages}
				data-sveltekit-noscroll
				href={`?${new URLSearchParams({ ...data.query, page: String(data.pages) })}`}>&gt;&gt;</a
			>
		</p>
		{#each Object.entries(data.query) as [key, value]}
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
</style>
