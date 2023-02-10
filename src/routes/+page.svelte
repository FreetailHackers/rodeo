<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email: string;
</script>

{#if data.user}
	<p>
		Welcome to Rodeo{#if data.user.name !== null}, {data.user.name}{/if}!
	</p>

	<!-- Admin announcements panel -->
	<Announcements announcements={data.announcements} admin={data.user.role === Role.ADMIN} />
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
	<Announcements announcements={data.announcements} admin={false} />
{/if}
