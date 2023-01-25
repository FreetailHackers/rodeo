<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email: string;
</script>

{#if data.user}
	<p>Welcome to Rodeo, {data.user.name}!</p>
	{#if data.announcements.length > 0}
		<ul>
			{#each data.announcements as announcement}
				<li>
					<h4>{announcement.title}</h4>
					<p>{announcement.body}</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>There are no announcements at this time.</p>
		<br />
	{/if}
	<form method="POST" action="?/logout" use:enhance>
		<button>Logout</button>
	</form>
{:else}
	<h1>Welcome to Rodeo</h1>
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
{/if}

<style>
	ul {
		list-style: none;
		border: 1px solid black;
		padding: 1rem;
	}

	h4 {
		margin: 0;
	}

	p {
		margin-bottom: 0;
	}
</style>
