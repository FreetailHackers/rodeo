<script lang="ts">
	import { enhance } from '$app/forms';
	import fuzzysort from 'fuzzysort';
	import UserCard from '$lib/components/user-card.svelte';
	import type { Prisma } from '@prisma/client';

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

	// Validate that the selected action can be applied to the selected users
	// Throws an error if the action is invalid, otherwise returns a string
	function validateSelection(
		action: string,
		filtered: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>[],
		selected: boolean[]
	) {
		if (action === '') {
			throw 'You must select an action.';
		}
		if (selected.filter(Boolean).length === 0) {
			throw 'You must select at least one user.';
		}
		if (action === 'admissions') {
			if (
				filtered.filter(
					(user, i) =>
						selected[i] &&
						user.authUser.status !== 'APPLIED' &&
						user.authUser.status !== 'WAITLISTED'
				).length > 0
			) {
				throw 'You can only perform admissions on users that have applied or are waitlisted.';
			}
			return `${
				selected.filter(Boolean).length
			} selected users will be added to the pending decisions pool.
						These decisions will NOT be visible until you release them.`;
		}
		if (action === 'status') {
			return `${
				selected.filter(Boolean).length
			} selected users will have their status immediately set.
					This will NOT send any notifications and WILL delete any pending (unreleased) decisions.`;
		}
		if (action === 'role') {
			if (
				filtered.filter((user, i) => selected[i] && user.authUserId === data.user.id).length > 0
			) {
				throw 'You cannot change your own role.';
			}
			return `${selected.filter(Boolean).length} selected users will have their role set.`;
		}
		if (action === 'release') {
			if (filtered.filter((user, i) => selected[i] && user.decision === null).length > 0) {
				throw 'You can only release decisions for users with a pending decision.';
			}
			return `${
				selected.filter(Boolean).length
			} selected users will have their decisions released.`;
		}
	}
</script>

<h1>Master Database</h1>

<!-- Search filters -->
<fieldset id="filter">
	<select id="key" bind:value={key} class="margin-bottom-1">
		<option value="email">Email</option>
		<option value="role">Role</option>
		<option value="status">Status</option>
		<optgroup label="Application Questions">
			{#each data.questions as question}
				<option value={'application' + '.' + question.id}>{question.label}</option>
			{/each}
		</optgroup>
	</select>
	<div id="condition">
		<select bind:value={filter}>
			{#if key === 'email' || key === 'role' || key === 'status' || question?.type === 'SENTENCE' || question?.type === 'PARAGRAPH'}
				<option value="contains">Contains</option>
				<option value="is">Is exactly</option>
				<option value="regex">Regex</option>
				<option value="fuzzy">Fuzzy</option>
			{:else}
				<option value="UNSUPPORTED">Filtering on this question type is not supported yet!</option>
			{/if}
		</select>
		<input type="text" name="search" bind:value={search} placeholder="Search" autocomplete="off" />
	</div>
</fieldset>

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
				{(() => {
					try {
						return validateSelection(action, filtered, selected);
					} catch (e) {
						return e;
					}
				})()}
				<button
					type="submit"
					disabled={(() => {
						try {
							validateSelection(action, filtered, selected);
							return false;
						} catch (e) {
							return true;
						}
					})()}
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
							name={'id.' + user.authUserId}
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
						<a href="mailto:{user.authUser.email}">{user.authUser.email}</a>
						<span class="grow" />
						<span
							class="{user.decision?.status.toLowerCase() ??
								user.authUser.status.toLowerCase()} dot"
						/>
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
	.margin-bottom-1 {
		margin-bottom: 1rem;
	}

	label {
		margin-bottom: 0.5rem;
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
		min-width: 0;
	}

	#condition {
		display: flex;
		gap: 0.5rem;
		width: 100%;
	}

	#condition input {
		flex-grow: 1;
		min-width: 0;
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
