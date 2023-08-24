<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { Parser } from '@json2csv/plainjs';
	import UserTable from './user-table.svelte';
	import { browser } from '$app/environment';

	export let data;

	let key = data.query.key ?? 'email';
	let search = data.query.search ?? '';

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
</script>

<h1>Master Database</h1>
<p><a href={csvDownloadLink} download="users.csv">Export search results as CSV</a></p>

<!-- Search filters -->
<form>
	<fieldset id="filter">
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
		<button>Search</button>
	</fieldset>
</form>

{#if data.users.length === 0}
	<p>No results found.</p>
{:else}
	<p>Showing results {data.start} through {data.start + data.users.length - 1} of {data.count}:</p>

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
	#filter {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5rem;
		width: 100%;
		min-width: 0;
	}

	.search {
		min-width: 0;
		flex: 1;
	}

	#filter button {
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
		width: 3rem;
	}

	.disabled {
		pointer-events: none;
		text-decoration: none;
		opacity: 0.5;
	}
</style>
