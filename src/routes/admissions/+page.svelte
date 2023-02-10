<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.user === null}
	<p>Congratulations! You've read every application.</p>
{:else}
	<div>
		<h1>{data.user.name}</h1>
		<p>Email: {data.user.email}</p>
		<p>Major: {data.user.major}</p>
	</div>
	<form method="POST" use:enhance>
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
