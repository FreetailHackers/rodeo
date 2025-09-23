<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';
	import type { Prisma, Question, AuthUser } from '@prisma/client';
	import Badge from '$lib/components/Badge.svelte';

	interface Props {
		users: (Prisma.UserGetPayload<{
			include: { authUser: true; decision: true };
		}> & {
			teammates: { email: string; status: string }[];
		})[];
		self: AuthUser;
		questions: Question[];
	}

	let { users, self, questions }: Props = $props();

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

<!-- Status Legend -->
<div style="margin-bottom: 1rem;">
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
					<!-- ...existing code... -->
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
						<a href="mailto:{user.authUser.email}">{user.authUser.email}</a>
						<span class="grow"></span>
						<Badge
							color={user.authUser.status === 'CREATED'
								? 'gray'
								: user.authUser.status === 'APPLIED'
									? 'dark'
									: user.authUser.status === 'ACCEPTED'
										? 'green'
										: user.authUser.status === 'REJECTED'
											? 'red'
											: user.authUser.status === 'WAITLISTED'
												? 'orange'
												: user.authUser.status === 'CONFIRMED'
													? 'teal'
													: user.authUser.status === 'DECLINED'
														? 'pink'
														: 'gray'}
							variant="filled"
							title={user.decision?.status ?? user.authUser.status}
							style="margin-left: 1rem;"
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

	label {
		color: var(--accent);
	}
</style>
