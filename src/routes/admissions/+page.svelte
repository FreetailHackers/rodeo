<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import UserCard from '$lib/components/user-card.svelte';
	import { Role } from '@prisma/client';
	import Spinner from '$lib/components/spinner.svelte';
	import { toasts } from '$lib/stores';

	let { data } = $props();
	let selectedRole = $state(data.selectedRole) as Role;
	let selectedStatus = $state(data.selectedStatus) as 'APPLIED' | 'WAITLISTED' | undefined;
	let applicant_index = $state(0);
	let loading = $state(false);

	function lookingAt(role: Role) {
		selectedRole = role;
		const url = new URL(page.url);
		url.searchParams.set('role', role);
		goto(url.toString(), { replaceState: true });
		applicant_index = 0;
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
		applicant_index = 0;
	}

	function gotoPrevUser() {
		if (applicant_index <= 0) {
			return;
		}
		applicant_index--;
	}

	function gotoNextUser(maxLength: number) {
		if (applicant_index >= maxLength - 1) {
			return;
		}
		applicant_index++;
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

	{#if data.users === null || data.users.length === 0}
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

		{#if data.users[applicant_index].authUser.roles?.includes(selectedRole)}
			{#if data.users[applicant_index].isBlacklisted}
				<div class="bl-warning" role="alert" aria-live="polite">
					⚠️ <strong>Warning:</strong> This person is blacklisted
				</div>
			{/if}

			<!-- Navigation info above UserCard -->
			<div style="margin-bottom: 0.5rem;">
				Applicant {applicant_index + 1} / {data.users.length}
			</div>
			<!-- Navigation buttons above UserCard -->
			<div class="nav-buttons" style="margin-bottom: 1rem; display: flex; gap: 1rem;">
				<button type="button" onclick={() => gotoPrevUser()}>Prev</button>
				<button type="button" onclick={() => gotoNextUser(data.users.length)}>Next</button>
			</div>

			<h1>
				{data.users[applicant_index].authUser.email}
			</h1>

			<UserCard
				user={data.users[applicant_index]}
				questions={data.questions}
				teammates={data.users[applicant_index].teammates}
			/>

			<div id="form">
				<div id="padding"></div>
				<form
					method="POST"
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							await update();

							if (result.type === 'success') {
								loading = false;
							} else {
								loading = false;
								toasts.notify('Could not save decision!');
							}

							if (data.users && applicant_index >= data.users.length) {
								applicant_index = Math.max(0, data.users.length - 1);
							}
						};
					}}
				>
					<input type="hidden" name="id" value={data.users[applicant_index].authUserId} />

					<!-- Accept -->
					<button
						id="form-buttom"
						type="submit"
						formaction="?/accept"
						disabled={data.users[applicant_index].isBlacklisted || loading}
						title={data.users[applicant_index].isBlacklisted
							? 'Blacklisted — action disabled'
							: 'Accept'}
					>
						{#if loading}
							<Spinner size={18} />
						{:else}
							Accept
						{/if}
					</button>

					<!-- Reject -->
					<button id="form-buttom" type="submit" formaction="?/reject" disabled={loading}>
						{#if loading}
							<Spinner size={18} />
						{:else}
							Reject
						{/if}</button
					>

					<!-- Waitlist -->
					<button
						id="form-buttom"
						type="submit"
						formaction="?/waitlist"
						disabled={data.users[applicant_index].isBlacklisted || loading}
						title={data.users[applicant_index].isBlacklisted
							? 'Blacklisted — action disabled'
							: 'Waitlist'}
					>
						{#if loading}
							<Spinner size={18} />
						{:else}
							Waitlist
						{/if}
					</button>
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
		padding-bottom: 1rem;
	}
	button {
		flex-grow: 1;
		white-space: nowrap;
	}
	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}

	#form-button {
		flex-grow: 1;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.bl-warning {
		margin: 0.75rem 0 1rem;
		padding: 0.75rem 1rem;
		background: #fee2e2;
		color: #7f1d1d;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		font-size: 0.95rem;
	}
</style>
