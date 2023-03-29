<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let data;

	let email: string;
</script>

{#if data.user}
	<SvelteMarkdown source={data.settings.homepageText} />

	<!-- Admin announcements panel -->
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.role === Role.ADMIN} />
	<form method="POST" action="?/logout" use:enhance>
		<button type="submit" id="logout">Logout</button>
	</form>
{:else}
	<!-- Signup page -->
	{#if !data.applicationOpen}
		<p>
			<b>
				NOTE: Applications are closed. If you would like to be notified of future events, you may
				enter your email below to subscribe to our mailing list.
			</b>
		</p>
	{/if}
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email: </label>
		<input
			bind:value={email}
			type="email"
			name="email"
			placeholder="student@example.edu"
			required
		/>
		<button>Continue</button>
	</form>
	<p>
		For assistance with registration, contact <a href="mailto:tech@freetailhackers.com"
			>tech@freetailhackers.com</a
		>.
	</p>
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={false} />
{/if}

<style>
	#logout {
		margin-top: 1rem;
	}
</style>
