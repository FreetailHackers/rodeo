<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email: string;
</script>

{#if data.user}
	<p>Welcome to Rodeo, {data.user.name}!</p>
	{#if data.user.role === 'ADMIN'}
		<form method="POST" action="?/announce" use:enhance>
			<textarea name="announcement" placeholder="Make an announcement here..." />
			<button>Announce</button>
		</form>
		<br />
		{#if form}
			{form}
		{/if}
	{/if}
	<Announcements announcements={data.announcements} />
	<form method="POST" action="?/logout" use:enhance>
		<button>Logout</button>
	</form>
{:else}
	<h1>Welcome to Rodeo</h1>
	<p>
		Rodeo is Freetail Hackers' registration platform and information board for hackathon attendees.
	</p>
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email: </label>
		<input bind:value={email} type="email" name="email" placeholder="student@example.edu" />
		<button>Register</button>
	</form>
	{#if form === 'EMAIL_SENT'}
		<p>We sent a magic login link to your email!</p>
	{:else if form != null}
		{#if form === 'EMAIL_INVALID'}
			<p>Please enter a valid email.</p>
		{:else if form === 'EMAIL_TAKEN'}
			<p>This email is already taken.</p>
		{:else if form === 'EMAIL_FAILURE'}
			<p>Failed to send login email; please try again later.</p>
		{/if}
		<p>
			For help, contact <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
		</p>
	{/if}
	<h1>Announcements</h1>
	<Announcements announcements={data.announcements} />
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	textarea {
		margin-bottom: 1rem;
	}
</style>
