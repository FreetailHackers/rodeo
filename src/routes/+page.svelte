<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: announceButtonText = form ?? 'Announce';

	let email: string;
</script>

{#if data.user}
	<p>Welcome to Rodeo, {data.user.name}!</p>

	<!-- Admin announcements panel -->
	{#if data.user.role === Role.ADMIN}
		<form method="POST" action="?/announce" use:enhance>
			<textarea name="announcement" placeholder="Make an announcement here..." required />
			<button>{announceButtonText}</button>
		</form>
	{/if}
	<Announcements announcements={data.announcements} action="?/unannounce" />
	<form method="POST" action="?/logout" use:enhance>
		<button>Logout</button>
	</form>
{:else}
	<!-- Signup page -->
	<h1>Welcome to Rodeo</h1>
	<p>
		Rodeo is Freetail Hackers' registration platform and information board for hackathon attendees.
	</p>
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email: </label>
		<input
			bind:value={email}
			type="email"
			name="email"
			placeholder="student@example.edu"
			required
		/>
		<button>Register</button>
	</form>
	{#if form}
		<p>{form}</p>
		<p>
			For help, contact <a href="mailto:tech@freetailhackers.com">tech@freetailhackers.com</a>.
		</p>
	{/if}
	<h1>Announcements</h1>
	<Announcements announcements={data.announcements} action="?/unannounce" />
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
