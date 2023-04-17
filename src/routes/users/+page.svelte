<script lang="ts">
	import { enhance } from '$app/forms';
	import fuzzysort from 'fuzzysort';
	import UserCard from '$lib/components/user-card.svelte';
	import Dropdown from '$lib/components/dropdown.svelte';

	export let data;

	let DISPLAY_LIMIT = 25;

	let key = 'email';
	let filter = '';
	let search = '';
	let action = 'admissions';

	// The question that is currently being filtered on
	$: question = data.questions.find((question) => 'application.' + question.id === key);
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
	$: filtered = data.users;
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
			filtered = data.users;
		} else {
			if (filter === 'contains') {
				filtered = data.users.filter((user) =>
					getNestedProperty(user, key)?.toLowerCase().includes(search.toLowerCase())
				);
			} else if (filter === 'is') {
				filtered = data.users.filter(
					(user) => getNestedProperty(user, key)?.toLowerCase() === search.toLowerCase()
				);
			} else if (filter === 'regex') {
				filtered = data.users.filter((user) =>
					new RegExp(search, 'i').test(getNestedProperty(user, key))
				);
			} else if (filter === 'fuzzy') {
				filtered = fuzzysort.go(search, data.users, { key }).map((user) => user.obj);
			} else if (filter === 'UNSUPPORTED') {
				filtered = [];
			}
			selectAll.indeterminate = false;
		}
	}
</script>

<h1>Add New User</h1>
<form method="POST" action="?/create" use:enhance>
	<label for="email">Email</label>
	<input type="email" name="email" id="email" placeholder="email@example.com" required />
	<Dropdown
		label="Role"
		name="role"
		options={['HACKER', 'ADMIN', 'ORGANIZER', 'JUDGE', 'VOLUNTEER', 'SPONSOR']}
		value=""
		required
	/>
	<button type="submit" value="Create">Create User</button>
</form>

<h1>Master Database</h1>

<!-- Search filters -->
<div id="filter">
	<select bind:value={key}>
		<option value="email">Email</option>
		<option value="role">Role</option>
		<option value="status">Status</option>
		<optgroup label="Application Questions">
			{#each data.questions as question}
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
	<input type="text" name="search" bind:value={search} placeholder="Search" autocomplete="off" />
</div>

<p>
	Found {filtered.length} results{#if filtered.length > DISPLAY_LIMIT}&nbsp;(showing first {DISPLAY_LIMIT}){/if}:
</p>

<form
	method="POST"
	use:enhance={() => {
		selectAll.indeterminate = false;
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
	action="?/bulk"
>
	<ul>
		<!-- Actions -->
		<li id="header">
			<div class="flex-align-center">
				<input
					type="checkbox"
					id="selectAll"
					bind:this={selectAll}
					on:click={() => (selected = selected.map(() => selectAll.checked))}
				/>
				Select an action:
			</div>
			<div id="actions">
				<div class="flex-align-center">
					<input
						type="radio"
						name="action"
						id="user-admissions"
						bind:group={action}
						value="admissions"
					/>
					<label for="user-admissions">Admissions:&nbsp;</label>
					<span class="grow" />
					<select name="user-admissions">
						<option value="ACCEPTED">Accept</option>
						<option value="REJECTED">Reject</option>
						<option value="WAITLISTED">Waitlist</option>
					</select>
				</div>
				<div class="flex-align-center">
					<input type="radio" name="action" id="user-status" bind:group={action} value="status" />
					<label for="user-status">Set status:&nbsp;</label>
					<span class="grow" />
					<select name="user-status">
						<option value="CREATED">Created</option>
						<option value="APPLIED">Applied</option>
						<option value="ACCEPTED">Accepted</option>
						<option value="REJECTED">Rejected</option>
						<option value="WAITLISTED">Waitlisted</option>
						<option value="CONFIRMED">Confirmed</option>
						<option value="DECLINED">Declined</option>
					</select>
				</div>
				<div class="flex-align-center">
					<input type="radio" name="action" id="user-role" bind:group={action} value="role" />
					<label for="user-role">Set role:&nbsp;</label>
					<span class="grow" />
					<select name="user-role">
						<option value="HACKER">Hacker</option>
						<option value="ADMIN">Admin</option>
						<option value="ORGANIZER">Organizer</option>
						<option value="JUDGE">Judge</option>
						<option value="VOLUNTEER">Volunteer</option>
						<option value="SPONSOR">Sponsor</option>
					</select>
				</div>
				<div class="flex-align-center">
					<input type="radio" name="action" id="user-release" bind:group={action} value="release" />
					<label for="user-release">Release decisions</label>
				</div>
				{#if action === ''}
					You must select an action.
				{:else if selected.filter(Boolean).length === 0}
					You must select at least one user.
				{:else if action === 'admissions'}
					{#if filtered.filter((user, i) => selected[i] && user.status !== 'APPLIED' && user.status !== 'WAITLISTED').length > 0}
						You can only perform admissions on users that have applied or are waitlisted.
					{:else}
						{selected.filter(Boolean).length} selected users will be added to the pending decisions pool.
						These decisions will NOT be visible until you release them.
					{/if}
				{:else if action === 'status'}
					{selected.filter(Boolean).length} selected users will have their status immediately set. This
					will NOT send any notifications and WILL delete any pending (unreleased) decisions.
				{:else if action === 'role'}
					{selected.filter(Boolean).length} selected users will have their role set.
				{:else if action === 'release'}
					{#if filtered.filter((user, i) => selected[i] && user.decision === null).length > 0}
						You can only release decisions for users with a pending decision.
					{:else}
						{selected.filter(Boolean).length} selected users will have their decisions released.
					{/if}
				{/if}
				<button
					type="submit"
					disabled={selected.filter(Boolean).length === 0 ||
						action === '' ||
						(action === 'admissions' &&
							filtered.filter(
								(user, i) =>
									selected[i] && user.status !== 'APPLIED' && user.status !== 'WAITLISTED'
							).length > 0) ||
						(action === 'release' &&
							filtered.filter((user, i) => selected[i] && user.decision === null).length > 0)}
				>
					Confirm
				</button>
			</div>
		</li>

		<!-- Data -->
		{#each filtered.slice(0, DISPLAY_LIMIT) as user, i}
			<li>
				<details>
					<summary class="flex-align-center">
						<input
							type="checkbox"
							name={'id.' + user.id}
							checked={selected[i]}
							on:click={() => {
								selected[i] = !selected[i];
								selectAll.indeterminate = false;
								if (
									selected.filter(Boolean).length === Math.min(data.users.length, DISPLAY_LIMIT)
								) {
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
						<UserCard {user} questions={data.questions} />
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

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		border: 2px solid black;
		padding: 1rem;
		/* simulate border-collapse */
		margin-top: -2px;
	}

	#header {
		display: flex;
		flex-direction: column;
	}

	#actions select {
		width: 7rem;
	}

	.flex-align-center {
		display: flex;
		align-items: center;
	}

	#actions {
		padding-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	#filter {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	summary {
		list-style: none;
	}

	summary a {
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
