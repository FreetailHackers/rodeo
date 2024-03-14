<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admissions</title>
</svelte:head>
<div class="main-content">
	{#if data.user === null}
		<p>Congratulations! You've read every application.</p>
	{:else}
		<h1>{data.user.authUser.email}</h1>
		<UserCard user={data.user} questions={data.questions} />
		<div id="form">
			<div id="padding" />
			<form method="POST" use:enhance>
				<input type="hidden" name="id" value={data.user.authUserId} />
				<button type="submit" formaction="?/accept">Accept</button>
				<button type="submit" formaction="?/reject">Reject</button>
				<button type="submit" formaction="?/waitlist">Waitlist</button>
			</form>
		</div>
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

	form {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
		background: white;
		padding-bottom: 1rem;
	}

	button {
		flex-grow: 1;
	}
</style>
