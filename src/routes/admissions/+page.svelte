<script lang="ts">
	import { enhance } from '$app/forms';
	import User from '$lib/components/user.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.user === null}
	<p>Congratulations! You've read every application.</p>
{:else}
	<h1>{data.user.name}</h1>
	<User user={data.user} />
	<form method="POST" use:enhance>
		<input type="hidden" name="id" value={data.user.id} />
		<button type="submit" formaction="?/accept">Accept</button>
		<button type="submit" formaction="?/reject">Reject</button>
		<button type="submit" formaction="?/waitlist">Waitlist</button>
	</form>
{/if}

<style>
	form {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
	}

	button {
		flex-grow: 1;
	}
</style>
