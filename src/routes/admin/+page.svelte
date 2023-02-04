<script lang="ts">
	import fuzzysort from 'fuzzysort';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let search = data.search ?? '';
	$: filtered = data.users;

	function searchUsers() {
		if (search === '') {
			filtered = data.users;
		} else {
			filtered = fuzzysort.go(search, data.users, { key: 'name' }).map((user) => user.obj);
		}
	}

	onMount(async () => {
		// Disable search form submission when JavaScript is enabled as it automatically searches incrementally
		document.getElementById('search')?.addEventListener('submit', (e) => {
			e.preventDefault();
		});
		// Remove query parameters
		if (new URLSearchParams(location.search).get('search') !== null) {
			location.href = '/admin';
		}
	});
</script>

<h1>Master Database</h1>
<form id="search">
	<input
		type="text"
		name="search"
		bind:value={search}
		on:input={searchUsers}
		placeholder="Search"
		autocomplete="off"
	/>
	<noscript><button>Search</button></noscript>
</form>
Found {filtered.length} results{#if search !== ''}&nbsp;for {search}{/if}:
<ul>
	{#each filtered as user}
		<li>
			<details>
				<summary>{user.name}</summary>
				<div>
					<p>Email: {user.email}</p>
					<p>Major: {user.major}</p>
					<p>Role: {user.role}</p>
				</div>
			</details>
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
	}

	li {
		border: 2px solid black;
		/* simulate border-collapse */
		margin-top: -2px;
	}

	summary {
		padding: 1rem;
	}

	details > div {
		padding: 0 1rem 0 1rem;
	}

	form {
		display: flex;
	}

	input {
		flex-grow: 1;
	}

	button {
		padding: 0 1rem;
		margin-left: 0.5rem;
	}
</style>
