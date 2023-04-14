<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Prisma, Question } from '@prisma/client';
	import fuzzysort from 'fuzzysort';
	import UserCard from './userCard.svelte';

	export let users: Prisma.UserGetPayload<{ include: { decision: true } }>[];
	export let questions: Question[];
	export let actions: string[];

	let DISPLAY_LIMIT = 25;

	let key = 'email';
	let filter = '';
	let search = '';

	// The question that is currently being filtered on
	$: question = questions.find((question) => 'application.' + question.id === key);
	// HACK: Unfortunately, Svelte doesn't update the bound value of a
	// select element when the options change, so we have to manually
	// do it.
	$: if (
		key === 'email' ||
		key === 'role' ||
		key === 'status' ||
		question?.type === 'SENTENCE' ||
		question?.type === 'PARAGRAPH'
	) {
		filter = 'contains';
	} else {
		filter = 'UNSUPPORTED';
	}
	$: filtered = users;
	$: selected = filtered.map(() => false).slice(0, DISPLAY_LIMIT);
	let selectAll: HTMLInputElement;

	// This is a function to get a nested property of an object where
	// the path is a string of the form 'a.b.c' where each part is a
	// property of the previous part.
	// e.g. getNestedProperty({ a: { b: { c: 'd' } } }, 'a.b.c') === 'd'
	function getNestedProperty(object: Record<string, unknown>, path: string) {
		const parts = path.split('.');
		for (const part of parts) {
			if (object[part] === undefined) {
				return '';
			}
			object = object[part] as Record<string, unknown>;
		}
		return object as unknown as string;
	}

	// Do the actual filtering
	$: {
		if (search === '') {
			filtered = users;
		} else {
			if (filter === 'contains') {
				filtered = users.filter((user) =>
					getNestedProperty(user, key)?.toLowerCase().includes(search.toLowerCase())
				);
			} else if (filter === 'is') {
				filtered = users.filter(
					(user) => getNestedProperty(user, key)?.toLowerCase() === search.toLowerCase()
				);
			} else if (filter === 'regex') {
				filtered = users.filter((user) =>
					new RegExp(search, 'i').test(getNestedProperty(user, key))
				);
			} else if (filter === 'fuzzy') {
				filtered = fuzzysort.go(search, users, { key }).map((user) => user.obj);
			} else if (filter === 'UNSUPPORTED') {
				filtered = [];
			}
			selectAll.indeterminate = false;
		}
	}
</script>

<!-- Search filters -->
<div id="filter">
	<select bind:value={key}>
		<option value="email">Email</option>
		<option value="role">Role</option>
		<option value="status">Status</option>
		<optgroup label="Application Questions">
			{#each questions as question}
				<option value={'application' + '.' + question.id}>{question.label}</option>
			{/each}
		</optgroup>
	</select>
	<select bind:value={filter}>
		{#if key === 'email' || key === 'role' || key === 'status' || question?.type === 'SENTENCE' || question?.type === 'PARAGRAPH'}
			<option value="contains">Contains</option>
			<option value="is">Is exactly</option>
			<option value="regex">Matches regex</option>
			<option value="fuzzy">Matches fuzzy</option>
		{:else}
			<option value="UNSUPPORTED">Filtering on this question type is not supported yet!</option>
		{/if}
	</select>
</div>
<input type="text" name="search" bind:value={search} placeholder="Search" autocomplete="off" />

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
						<a href="mailto:{user.email}">{user.email}</a>
						<span class="grow" />
						<span class="{user.decision?.status.toLowerCase() ?? user.status.toLowerCase()} dot" />
					</summary>
					<div class="user">
						<UserCard {user} {questions} />
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

	#filter {
		display: flex;
		flex-direction: column;
	}

	summary {
		padding: 1rem;
		list-style: none;
		display: flex;
		align-items: center;
	}

	summary a {
		margin-left: 1rem;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.grow {
		flex-grow: 1;
	}

	.dot {
		border-radius: 50%;
		display: inline-block;
		margin: 0 1rem;
		min-height: 20px;
		max-height: 20px;
		min-width: 20px;
		max-width: 20px;
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

	input[type='checkbox'] {
		margin: 0;
		min-width: 1.5rem;
		min-height: 1.5rem;
	}

	button {
		padding: 0 1rem;
		margin-left: 0.5rem;
		text-transform: capitalize;
	}

	.user {
		padding-left: 1rem;
	}

	.accepted {
		background: rgb(93, 198, 93);
	}

	.rejected {
		background: rgb(255, 78, 78);
	}

	.waitlisted {
		background: orange;
	}

	.applied {
		background: rgb(63, 63, 63);
	}

	.created {
		background: lightgray;
	}

	.confirmed {
		background: darkgreen;
	}

	.declined {
		background: darkred;
	}
</style>
