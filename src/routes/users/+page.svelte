<script lang="ts">
	import { enhance } from '$app/forms';
	import fuzzysort from 'fuzzysort';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const DISPLAY_LIMIT = 100;

	let search = data.search ?? '';
	$: filtered = data.users;
	$: selected = filtered.map(() => false).slice(0, DISPLAY_LIMIT);

	let selectAll: HTMLInputElement;

	function searchUsers() {
		if (search === '') {
			filtered = data.users;
		} else {
			filtered = fuzzysort
				.go(search, data.users, { keys: ['name', 'email', 'major', 'status', 'role'] })
				.map((user) => user.obj);
		}
	}

	onMount(async () => {
		// Disable search form submission when JavaScript is enabled as it automatically searches incrementally
		document.getElementById('search')?.addEventListener('submit', (e) => {
			e.preventDefault();
		});
		// Remove query parameters
		if (new URLSearchParams(location.search).get('search') !== null) {
			location.href = location.pathname;
		}
	});
</script>

<h1>Master Database</h1>
<!-- Search box -->
<form id="search">
	<input
		type="text"
		name="search"
		bind:value={search}
		on:input={searchUsers}
		placeholder="Search"
		autocomplete="off"
	/>
	<noscript><button id="searchButton">Search</button></noscript>
</form>

<!-- Sorry for this monstrosity, couldn't figure out how to break each part onto its own line without spacing bugs -->
<p>
	Found {filtered.length} results{#if search !== ''}&nbsp;for {search}{/if}{#if filtered.length > DISPLAY_LIMIT}&nbsp;(showing
		first {DISPLAY_LIMIT}){/if}:
</p>

<!-- Table -->
<form method="POST" use:enhance>
	<ul>
		<!-- Actions -->
		<li>
			<div id="actions">
				<input
					type="checkbox"
					id="selectAll"
					bind:this={selectAll}
					on:click={() => (selected = selected.map(() => selectAll.checked))}
				/>
				<span>
					<button type="submit" formaction="?/accept">Accept</button>
					<button type="submit" formaction="?/reject">Reject</button>
					<button type="submit" formaction="?/waitlist">Waitlist</button></span
				>
			</div>
		</li>

		<!-- Data -->
		{#each filtered.slice(0, DISPLAY_LIMIT) as user, i}
			<li>
				<details>
					<summary>
						<input
							type="checkbox"
							name={'' + user.id}
							checked={selected[i]}
							on:click={() => {
								selected[i] = !selected[i];
								selectAll.indeterminate = false;
								if (selected.filter(Boolean).length === Math.min(filtered.length, DISPLAY_LIMIT)) {
									selectAll.checked = true;
								} else if (selected.filter(Boolean).length === 0) {
									selectAll.checked = false;
								} else {
									selectAll.indeterminate = true;
								}
							}}
						/>
						<label for={'' + user.id}>{user.name}</label>
					</summary>
					<div>
						<p>Email: {user.email}</p>
						<p>Major: {user.major}</p>
						<p>Role: {user.role}</p>
						<p>Status: {user.status}</p>
					</div>
				</details>
			</li>
		{/each}
	</ul>
</form>

<style>
	#search {
		flex-direction: row;
	}

	#actions {
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	#selectAll {
		margin-left: 0.5rem;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		border: 2px solid black;
		/* simulate border-collapse */
		margin-top: -2px;
	}

	summary {
		padding: 1rem;
		list-style: none;
		display: flex;
		align-items: center;
	}

	summary::after {
		content: ' ►';
	}

	details[open] summary:after {
		content: ' ▼';
	}

	details > div {
		padding: 0 1rem 0 1rem;
	}

	label {
		flex-grow: 1;
		margin: 0 1rem;
		z-index: -1;
	}

	input[type='text'] {
		flex-grow: 1;
		margin-bottom: 0;
	}

	input[type='checkbox'] {
		margin: 0;
		width: 1.5rem;
		height: 1.5rem;
	}

	button {
		padding: 0 1rem;
		margin-left: 0.5rem;
	}
</style>
