<script lang="ts">
	import type { User } from '@prisma/client';
	import fuzzysort from 'fuzzysort';
	import type { PageData } from './$types';

	export let data: PageData;
	export let search: string;
	export let filtered: User[] = data.users;

	function searchUsers() {
		if (search === '') {
			filtered = data.users;
		} else {
			filtered = fuzzysort.go(search, data.users, { key: 'name' }).map((user) => user.obj);
		}
	}
</script>

<h1>Master Database</h1>
<form>
	<input
		type="text"
		name="search"
		bind:value={search}
		on:input={searchUsers}
		placeholder="Search"
		autocomplete="off"
	/>
	<button>Search</button>
</form>
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
		margin-left: -2px;
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
		margin-right: 0.5rem;
	}
</style>
