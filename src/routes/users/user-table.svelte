<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import type { Prisma, Question, AuthUser } from '@prisma/client';

	const STATUS_COLOR_MAP: Record<string, string> = {
		CREATED: 'gray',
		APPLIED: 'dark',
		ACCEPTED: 'green',
		REJECTED: 'red',
		WAITLISTED: 'orange',
		CONFIRMED: 'teal',
		DECLINED: 'pink',
	};

	export type UserRow = Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }> & {
		teammates: { email: string; status: string }[];
		isBlacklisted?: boolean;
	};

	// Use ONE prop shape: UserRow[] for users
	let {
		users,
		self,
		questions,
	}: {
		users: UserRow[];
		self: AuthUser;
		questions: Question[];
	} = $props();

	let action = $state('admissions');
	let selected = $state(users.map(() => false));
	let selectAll = $state() as HTMLInputElement;

	$effect(() => {
		if (selectAll) {
			selectAll.indeterminate =
				selected.filter(Boolean).length > 0 && selected.filter(Boolean).length < users.length;
			selectAll.checked = selected.filter(Boolean).length === users.length;
		}
	});

	// Validate that the selected action can be applied to the selected users
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
					(user) => user.authUser.status !== 'APPLIED' && user.authUser.status !== 'WAITLISTED',
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

<div style="margin-bottom: 1rem; color: white;">
	<strong>Status Legend:</strong>
	<Badge color="gray" variant="filled">Created</Badge>
	<Badge color="dark" variant="filled">Applied</Badge>
	<Badge color="green" variant="filled">Accepted</Badge>
	<Badge color="red" variant="filled">Rejected</Badge>
	<Badge color="orange" variant="filled">Waitlisted</Badge>
	<Badge color="teal" variant="filled">Confirmed</Badge>
	<Badge color="pink" variant="filled">Declined</Badge>
</div>

<form
	method="POST"
	use:enhance={() => {
		if (selectAll) selectAll.indeterminate = false;
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
						onclick={() => (selected = selected.map(() => selectAll?.checked ?? false))}
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
						<span class="grow"></span>
						<select name="user-admissions">
							<option value="ACCEPTED">Accept</option>
							<option value="REJECTED">Reject</option>
							<option value="WAITLISTED">Waitlist</option>
						</select>
					</div>
					<div class="flex-align-center">
						<input type="radio" name="action" id="user-status" bind:group={action} value="status" />
						<label for="user-status">Set status:&nbsp;</label>
						<span class="grow"></span>
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
						<span class="grow"></span>
						<select name="role-to-add">
							<option value="HACKER">Hacker</option>
							<option value="ADMIN">Admin</option>
							<option value="ORGANIZER">Organizer</option>
							<option value="JUDGE">Judge</option>
							<option value="VOLUNTEER">Volunteer</option>
							<option value="SPONSOR">Sponsor</option>
							<option value="MENTOR">Mentor</option>
							<option value="UNDECLARED">Undeclared</option>
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
						<span class="grow"></span>
						<select name="role-to-remove">
							<option value="UNDECLARED">Undeclared</option>
							<option value="HACKER">Hacker</option>
							<option value="ADMIN">Admin</option>
							<option value="ORGANIZER">Organizer</option>
							<option value="JUDGE">Judge</option>
							<option value="VOLUNTEER">Volunteer</option>
							<option value="SPONSOR">Sponsor</option>
							<option value="MENTOR">Mentor</option>
							<option value="UNDECLARED">Undeclared</option>
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
								onclick={() => (selected[i] = !selected[i])}
							/>
						{/if}

						<a href={'mailto:' + user.authUser.email}>{user.authUser.email}</a>

						{#if user.isBlacklisted}
							<span style="margin-left: 0.5rem;">
								<Badge color="red" variant="filled" title="This user is blacklisted">
									Blacklisted
								</Badge>
							</span>
						{/if}

						<span class="grow"></span>
						<Badge
							color={STATUS_COLOR_MAP[user.authUser.status] ?? 'gray'}
							variant="filled"
							title={user.decision?.status ?? user.authUser.status}
						>
							{user.authUser.status.charAt(0) + user.authUser.status.slice(1).toLowerCase()}
						</Badge>
					</summary>

					<div class="user">
						<UserCard {user} {questions} teammates={user.teammates} />
					</div>
				</details>
			</li>
		{/each}
	</ul>
</form>

<style>
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		border: 2px solid var(--accent); /* changed for dark mode */
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
		color: var(--accent);
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

	label {
		color: var(--accent);
	}
</style>
