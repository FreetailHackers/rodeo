<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';
	import SocialLogin from '$lib/components/social-login.svelte';

	// Some helpful error messages triggered in /src/lib/authenticate.ts
	onMount(() => {
		if (location.search === '?unauthenticated') {
			toasts.notify('You must be logged in to do perform that action.');
		} else if (location.search === '?forbidden') {
			toasts.notify('You do not have permissions to do that.');
		}
	});
</script>

{#if data.user !== null}
	<SvelteMarkdown source={data.settings.homepageText} />

	<!-- Admin announcements panel -->
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.role === 'ADMIN'} />
	<form method="POST" action="?/logout" use:enhance>
		<button type="submit" id="logout">Logout</button>
	</form>
{:else}
	<!-- Signup page -->
	{#if !data.settings.applicationOpen}
		<p>
			<b>
				NOTE: Applications are closed. If you would like to be notified of future events, you may
				enter your email below to subscribe to our mailing list.
			</b>
		</p>
	{/if}
	<h1>Login</h1>
	<SocialLogin providers={data.providers} />

	<form
		method="POST"
		action="?/login"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<label for="email">Email</label>
		<input id="email" name="email" required />
		<label for="password">Password (<a href="/login/reset-password">forgot?</a>)</label>
		<input type="password" id="password" name="password" required />
		<button>Continue</button>
	</form>
	<p>
		Don't have an account yet? <a href="/register">Register here!</a>
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
