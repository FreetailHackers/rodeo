<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';
	import { Role } from '@prisma/client';

	export let data;

	let selectedRole: Role = Role.HACKER;

	function lookingAt(role: Role) {
		selectedRole = role;
	}
</script>

<svelte:head>
	<title>Rodeo | Admissions</title>
</svelte:head>
<div class="main-content">
	{#if data.user === null}
		<p>Congratulations! You've read every application.</p>
	{:else}
		<div class="role-buttons">
			<button on:click={() => lookingAt(Role.HACKER)}>Hackers</button>
			<button on:click={() => lookingAt(Role.JUDGE)}>Judges</button>
			<button on:click={() => lookingAt(Role.MENTOR)}>Mentors</button>
			<button on:click={() => lookingAt(Role.VOLUNTEER)}>Volunteers</button>
		</div>

		<!-- Display the selected role -->
		{#if selectedRole}
			<p>You are looking at <strong>{selectedRole}</strong> applicants</p>
		{/if}

		{#if data.user.authUser.roles?.includes(selectedRole)}
			<h1>{data.user.authUser.email}</h1>
			<UserCard user={data.user} questions={data.questions} teammates={data.teammates} />
			<div id="form">
				<div id="padding" />
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
		background: linear-gradient(transparent, white);
	}

	.role-buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	form {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
		background: white;
		padding-bottom: 1rem;
	}

	button {
		flex-grow: 1;
		white-space: nowrap;
	}
</style>
