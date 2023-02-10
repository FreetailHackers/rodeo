<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Prisma } from '@prisma/client';
	import fuzzysort from 'fuzzysort';
	import User from './user.svelte';

	export let users: Prisma.UserGetPayload<{ include: { decision: true } }>[];
	export let actions: string[];

	let DISPLAY_LIMIT = 25;

	let search = '';
	$: filtered = users;
	$: selected = filtered.map(() => false).slice(0, DISPLAY_LIMIT);
	let selectAll: HTMLInputElement;

	function searchUsers() {
		if (search === '') {
			filtered = users;
		} else {
			filtered = fuzzysort
				.go(search, users, { keys: ['name', 'email', 'major', 'status', 'role'] })
				.map((user) => user.obj);
			selectAll.indeterminate = false;
		}
	}
</script>

<input
	type="text"
	name="search"
	bind:value={search}
	on:input={searchUsers}
	placeholder="Search"
	autocomplete="off"
/>

<p>
	Found {filtered.length} results{#if filtered.length > DISPLAY_LIMIT}&nbsp;(showing first {DISPLAY_LIMIT}){/if}:
</p>

<form
	method="POST"
	use:enhance={() => {
		selectAll.indeterminate = false;
	}}
>
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
					{#each actions as action}
						<button type="submit" formaction={'?/' + action}>{action}</button>
					{/each}
				</span>
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
								if (selected.filter(Boolean).length === Math.min(users.length, DISPLAY_LIMIT)) {
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
					<div class="user">
						<User {user} />
					</div>
				</details>
			</li>
		{/each}
	</ul>
</form>

<style>
	input[type='text'] {
		width: 100%;
		margin-bottom: 0;
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

	input[type='checkbox'] {
		margin: 0;
		width: 1.5rem;
		height: 1.5rem;
	}

	button {
		padding: 0 1rem;
		margin-left: 0.5rem;
		text-transform: capitalize;
	}

	.user {
		padding-left: 1rem;
	}
</style>
