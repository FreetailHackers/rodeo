<script lang="ts">
	import type { Prisma } from '@prisma/client';
	import { Parser } from '@json2csv/plainjs';
	import UserTable from './user-table.svelte';
	import { browser } from '$app/environment';

	export let data;

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
		<select name="key">
			<option value="email">Email</option>
		</select>
		<input
			type="text"
			id="search"
			name="search"
			placeholder="Search"
			autocomplete="off"
			value={data.query.search ?? ''}
		/>
		<button>Search</button>
	</fieldset>
</form>

{#if data.users.length === 0}
	<p>No results found.</p>
{:else}
	<p>Showing results {data.start} through {data.start + data.users.length - 1}:</p>
	<UserTable users={data.users} selfID={data.user.id} questions={data.questions} />

	<form>
		<p id="page">
			<a
				class:disabled={Number(data.query.page ?? 1) === 1}
				data-sveltekit-noscroll
				href={(() => {
					const query = new URLSearchParams(data.query);
					query.set('page', '1');
					return `?${query}`;
				})()}>&lt;&lt;</a
			>
			<a
				class:disabled={Number(data.query.page ?? 1) === 1}
				data-sveltekit-noscroll
				href={(() => {
					const query = new URLSearchParams(data.query);
					query.set('page', `${Math.max(1, Number(data.query.page ?? 1) - 1)}`);
					return `?${query}`;
				})()}>&lt;</a
			>
			Page <input type="number" name="page" min="1" max={data.pages} value={data.query.page ?? 1} />
			of {data.pages}
			<a
				class:disabled={Number(data.query.page ?? 1) >= data.pages}
				data-sveltekit-noscroll
				href={(() => {
					const query = new URLSearchParams(data.query);
					query.set('page', `${Math.min(data.pages, Number(data.query.page ?? 1) + 1)}`);
					return `?${query}`;
				})()}>&gt;</a
			>
			<a
				class:disabled={Number(data.query.page ?? 1) >= data.pages}
				data-sveltekit-noscroll
				href={(() => {
					const query = new URLSearchParams(data.query);
					query.set('page', `${data.pages}`);
					return `?${query}`;
				})()}>&gt;&gt;</a
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

	#filter input {
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
