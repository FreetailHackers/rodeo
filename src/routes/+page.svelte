<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email: string;
</script>

{#if data.user}
	<p>Welcome to Rodeo, {data.user.name}!</p>
	{#if data.user.role === 'ADMIN'}
		<br />
		<form method="POST" action="?/announce" use:enhance>
			<textarea name="announcement" placeholder="Make an announcement here..." />
			<button>Announce</button>
		</form>
		<br />
		{#if form}
			{form}
		{/if}
	{/if}
	{#if data.announcements.length > 0}
		<ul>
			{#each data.announcements as announcement}
				<li>
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
	<p>
		Rodeo is Freetail Hackers' registration platform and information board for hackathon attendees.
	</p>
	<br />
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email: </label>
		<input bind:value={email} type="email" name="email" placeholder="student@example.edu" />
		<button>Register</button>
	</form>
	<br />
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
		padding-left: 0;
	}

	li {
		border: 2px solid black;
		padding: 1rem;
		margin-bottom: 1rem;
	}

	p {
		margin: 0;
	}

	form {
		display: flex;
		flex-direction: column;
	}

	textarea {
		margin-bottom: 1rem;
	}
</style>
