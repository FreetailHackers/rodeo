<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';
	import type { Prisma, Question } from '@prisma/client';
	import type { UserSchema } from 'lucia';

	//ADDED
	//from my understanding these lines are importing these components from the smelte library
	//and then importing the writable function to store and update values

	//THIS LINE IS GIVING ME AN ERROR SO I HAD TO COMMENT IT OUT BUT I NEED IT FOR THE CHIP
	//import { Button, Chip, Select } from "smelte";
	import { writable } from 'svelte/store';

	export let users: (Prisma.UserGetPayload<{
		include: { authUser: true; decision: true };
	}> & {
		teammates: { email: string; status: string }[];
	})[];

	export let self: UserSchema;
	export let questions: Question[];

	let action = 'admissions';
	$: selected = users.map(() => false);
	let selectAll: HTMLInputElement;
	$: if (selectAll) {
		selectAll.indeterminate =
			selected.filter(Boolean).length > 0 && selected.filter(Boolean).length < users.length;
		selectAll.checked = selected.filter(Boolean).length === users.length;
	}

	//ADDED
	//from my understanding this function is creating a store in Svelte that maps
	//status names to color values
	//keeps track of the colors associated with each status
	let statusColors = writable<Record<string, string>>({
		CREATED: 'gray',
		APPLIED: 'blue',
		ACCEPTED: 'green',
		REJECTED: 'red',
		WAITLISTED: 'yellow',
		CONFIRMED: 'teal',
		DECLINED: 'orange',
	});

	//ADDED
	//from my understanding this function is creating a store in Svelte that maps
	//role names to color values
	//keeps track of the colors associated with each role
	let roleColors = writable<Record<string, string>>({
		ADMIN: 'purple',
		ORGANIZER: 'indigo',
		JUDGE: 'brown',
		VOLUNTEER: 'pink',
		SPONSOR: 'cyan',
		HACKER: 'lime',
	});

	//ADDED
	//from my understanding this function takes a role and returns its corresponding color
	// import { get } from 'svelte/store';
	// function getRoleColor(role: string) {
	// 	return get(roleColors)[role] || 'gray';
	// }

	// //ADDED
	// //from my understanding this function takes a status and returns its corresponding color
	// function getStatusColor(status: string) {
	// 	return get(statusColors)[status] || 'gray';
	// }

	// //ADDED
	// //this based on my understanding gives you the option to change status or role color
	// function updateColor(type: 'status' | 'role', key: string, newColor: string) {
	// 	if (type === 'status') {
	// 		statusColors.update((colors) => ({ ...colors, [key]: newColor }));
	// 	} else {
	// 		roleColors.update((colors) => ({ ...colors, [key]: newColor }));
	// 	}
	// 	// TODO: Send update request to backend API
	// }

	// Validate that the selected action can be applied to the selected users
	// Throws an error if the action is invalid, otherwise returns a string
	function validateSelection(action: string, selected: boolean[]) {
		const selectedUsers = users.filter((_, i) => selected[i]);
		if (action === '') {
			throw 'You must select an action.';
		}
		if (selectedUsers.length === 0) {
			throw 'You must select at least one user.';
		}
		if (action === 'admissions') {
			if (
				selectedUsers.filter(
					(user) => user.authUser.status !== 'APPLIED' && user.authUser.status !== 'WAITLISTED'
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
		if (action === 'add-role') {
			if (selectedUsers.filter((user) => user.authUserId === self.id).length > 0) {
				throw 'You cannot change your own role.';
			}
			return `${
				selected.filter(Boolean).length
			} selected users will have the chosen role assigned to them.`;
		}
		if (action === 'remove-role') {
			if (selectedUsers.filter((user) => user.authUserId === self.id).length > 0) {
				throw 'You cannot change your own role.';
			}
			return `${selected.filter(Boolean).length} selected users will have the chosen role removed.`;
		}
		if (action === 'release') {
			if (selectedUsers.filter((user) => user.decision === null).length > 0) {
				throw 'You can only release decisions for users with a pending decision.';
			}
			return `${
				selected.filter(Boolean).length
			} selected users will have their decisions released.`;
		}
	}
</script>

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
		{#if self.roles.includes('ADMIN')}
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
						<input type="radio" name="action" id="add-role" bind:group={action} value="add-role" />
						<label for="add-role">Add role:&nbsp;</label>
						<span class="grow" />
						<select name="role-to-add">
							<option value="HACKER">Hacker</option>
							<option value="ADMIN">Admin</option>
							<option value="ORGANIZER">Organizer</option>
							<option value="JUDGE">Judge</option>
							<option value="VOLUNTEER">Volunteer</option>
							<option value="SPONSOR">Sponsor</option>
						</select>
					</div>
					<div class="flex-align-center">
						<input
							type="radio"
							name="action"
							id="remove-role"
							bind:group={action}
							value="remove-role"
						/>
						<label for="remove-role">Remove role:&nbsp;</label>
						<span class="grow" />
						<select name="role-to-remove">
							<option value="HACKER">Hacker</option>
							<option value="ADMIN">Admin</option>
							<option value="ORGANIZER">Organizer</option>
							<option value="JUDGE">Judge</option>
							<option value="VOLUNTEER">Volunteer</option>
							<option value="SPONSOR">Sponsor</option>
						</select>
					</div>
					<div class="flex-align-center">
						<input
							type="radio"
							name="action"
							id="user-release"
							bind:group={action}
							value="release"
						/>
						<label for="user-release">Release decisions</label>
					</div>
					{(() => {
						try {
							return validateSelection(action, selected);
						} catch (e) {
							return e;
						}
					})()}
					<button
						type="submit"
						disabled={(() => {
							try {
								validateSelection(action, selected);
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
		{/if}

		<!-- Data -->
		{#each users as user, i (user.authUserId)}
			<li>
				<details>
					<summary class="flex-align-center">
						{#if self.roles.includes('ADMIN')}
							<input
								type="checkbox"
								name={'id ' + user.authUserId}
								checked={selected[i]}
								on:click={() => (selected[i] = !selected[i])}
							/>
						{/if}
						<a href="mailto:{user.authUser.email}">{user.authUser.email}</a>
						<span class="grow" />
						<span />
					</summary>
					<div class="user">
						<UserCard {user} {questions} teammates={user.teammates} />
					</div>
				</details>
			</li>
		{/each}
	</ul>
</form>

<!-- ADDED -->
<main class="p-4">
	<!-- Status Legend -->
	<section class="mb-4">
		<h3 class="text-lg font-bold mb-2">Status Legend</h3>
		<div class="flex flex-wrap">
			{#each Object.entries($statusColors) as [status, color]}
				<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
				<!-- <Chip class="m-2" color="{color}">{status}</Chip> -->
			{/each}
		</div>
	</section>

	<!-- Role Legend -->
	<section class="mb-4">
		<h3 class="text-lg font-bold mb-2">Role Legend</h3>
		<div class="flex flex-wrap">
			{#each Object.entries($roleColors) as [role, color]}
				<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
				<!-- <Chip class="m-2" color="{color}">{role}</Chip> -->
			{/each}
		</div>
	</section>

	<!-- Admin Panel for Changing Colors -->
	{#if self.roles.includes('ADMIN')}
		<section class="mb-4 p-4 border rounded">
			<h3 class="text-lg font-bold mb-2">Modify Colors</h3>
			<div class="grid grid-cols-2 gap-4">
				<!-- Status Color Modifications -->
				{#each Object.entries($statusColors) as [status, color]}
					<div class="flex items-center">
						<span class="mr-2">{status}</span>
						<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
						<!-- <Select options={["gray", "blue", "green", "red", "yellow", "teal", "orange", "purple"]}
							bind:value={$statusColors[status]}
							on:change={(e) => updateColor("status", status, e.detail.value)} /> -->
					</div>
				{/each}

				<!-- Role Color Modifications -->
				{#each Object.entries($roleColors) as [role, color]}
					<div class="flex items-center">
						<span class="mr-2">{role}</span>
						<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
						<!-- <Select options={["gray", "blue", "green", "red", "yellow", "teal", "orange", "purple"]}
							bind:value={$roleColors[role]}
							on:change={(e) => updateColor("role", role, e.detail.value)} /> -->
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Users List -->
	<ul>
		{#each users as user}
			<li class="p-2 border-b">
				<div class="flex justify-between">
					<span>{user.authUser.email}</span>
					<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
					<!-- <Chip color="{getStatusColor(user.authUser.status)}">{user.authUser.status}</Chip> -->
				</div>
				<div class="mt-1">
					{#each user.authUser.roles as role}
						<!-- HAD TO COMMENT THIS LINE OUT BECAUSE IT GAVE ME AN ERROR AFTER I COMMENTED OUT THE IMPORT SMELTE -->
						<!-- <Chip color="{getRoleColor(role)}">{role}</Chip> -->
					{/each}
				</div>
			</li>
		{/each}
	</ul>
</main>

<style>
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

	#header {
		display: flex;
		flex-direction: column;
		padding: 1rem;
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

	summary {
		list-style: none;
		padding: 1rem;
		cursor: pointer;
		transition: margin 0.1s ease-out;
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

	details[open] summary {
		margin-bottom: 2rem;
	}

	.user {
		/*
		Possible HACK: for reasons I don't fully understand, the above
		selector needs a sufficiently large margin-bottom for the
		<details> opening animation to work. However, this leaves too
		much space between the <details> and the <div> below it, so we
		compensate for that here.
		*/
		margin-top: -2rem;
		margin-bottom: 1rem;
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
