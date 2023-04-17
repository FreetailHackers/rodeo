<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import { Role } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';

	let email: string;

	onMount(() => {
		if (location.search === '?unauthenticated') {
			toasts.notify('You must be logged in to do perform that action.');
		} else if (location.search === '?forbidden') {
			toasts.notify('You do not have permissions to do that.');
		} else if (location.search === '?magiclink') {
			toasts.notify(
				'That magic link either never existed or expired. You can request a new one by reregistering with your email.'
			);
		}
	});
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
	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}
</style>
