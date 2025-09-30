<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import UserCard from '$lib/components/user-card.svelte';
	import { Role } from '@prisma/client';

	let { data } = $props();

	let selectedRole = $state(data.selectedRole) as Role;
	let selectedStatus = $state(data.selectedStatus) as 'APPLIED' | 'WAITLISTED' | undefined;

	function lookingAt(role: Role) {
		selectedRole = role;
		const url = new URL(page.url);
		url.searchParams.set('role', role);
		goto(url.toString(), { replaceState: true });
	}

	function filterByStatus(status?: 'APPLIED' | 'WAITLISTED') {
		selectedStatus = status;
		const url = new URL(page.url);
		if (status) {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}
		goto(url.toString(), { replaceState: true });
	}
</script>

<svelte:head>
	<title>Rodeo | Admissions</title>
</svelte:head>
<div class="main-content">
	<div class="role-buttons">
		<button onclick={() => lookingAt(Role.HACKER)}>Hackers</button>
		<button onclick={() => lookingAt(Role.JUDGE)}>Judges</button>
		<button onclick={() => lookingAt(Role.MENTOR)}>Mentors</button>
		<button onclick={() => lookingAt(Role.VOLUNTEER)}>Volunteers</button>
	</div>

	<div class="status-buttons">
		<button onclick={() => filterByStatus()}> All </button>
		<button onclick={() => filterByStatus('APPLIED')}> Applied </button>
		<button onclick={() => filterByStatus('WAITLISTED')}> Waitlisted </button>
	</div>

	{#if data.user === null}
		<p>
			No more unread <strong>{data.selectedStatus?.toLowerCase()}</strong>
			<strong>{data.selectedRole.toLowerCase()}</strong> applications found.
		</p>
		<p>Select "All" to see both applied and waitlisted applicants, or choose a different role.</p>
	{:else}
		<!-- Display the selected role and status -->
		{#if selectedRole}
			<p>
				You are looking at <strong>{selectedRole}</strong> applicants
				{#if selectedStatus}
					with status <strong>{selectedStatus}</strong>
				{/if}
			</p>
		{/if}

		{#if data.user.authUser.roles?.includes(selectedRole)}
			<h1>{data.user.authUser.email}</h1>
			<UserCard user={data.user} questions={data.questions} teammates={data.teammates} />
			<div id="form">
				<div id="padding"></div>
				<form method="POST" use:enhance>
					<input type="hidden" name="id" value={data.user.authUserId} />
					<button type="submit" formaction="?/accept">Accept</button>
					<button type="submit" formaction="?/reject">Reject</button>
					<button type="submit" formaction="?/waitlist">Waitlist</button>
				</form>
			</div>
		{:else}
			<p>There are currently no applicants for <strong>{selectedRole}</strong></p>
		{/if}
	{/if}
</div>

<style>
	#form {
		position: sticky;
		bottom: 0;
	}

	#padding {
		height: 1rem;
		background: linear-gradient(transparent, var(--blue)); /* changed for dark mode */
	}

	.status-buttons {
		margin-top: 2rem;
	}

	.role-buttons,
	.status-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	form {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
		background: var(--blue); /* changed for dark mode */
		padding-bottom: 1rem;
	}

	button {
		flex-grow: 1;
		white-space: nowrap;
	}
</style>
