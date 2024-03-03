<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';
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

<svelte:head>
	<title>Rodeo | Home</title>
</svelte:head>

{#if data.user !== undefined}
	<SvelteMarkdown source={data.settings.homepageText} />

	<form method="POST" action="?/logout" use:enhance>
		<button type="submit" id="logout">Logout</button>
	</form>
	<!-- Admin announcements panel -->
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
	<!-- paste final sponsor code here 1-->
	<hr />
{:else}
	<!-- Signup page -->
	{#if !data.canApply}
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
		<input id="email" name="email" required autocomplete="username" />
		<label for="password">Password (<a href="/login/reset-password">forgot?</a>)</label>
		<!-- HACK: Not required so we can easily log into test accounts lol -->
		<input type="password" id="password" name="password" autocomplete="current-password" />
		<button>Continue</button>
	</form>
	<p>
		Don't have an account yet? <a href="/register">Register here!</a>
	</p>
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={false} />
	<hr />
{/if}

<section id="Schedule">
	<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />
</section>

<section id="Sponsors">
	<Sponsors
		sponsors={['Roblox', 'Capital One', 'Mercury Financial', 'Red Bull', 'Stand Out Stickers']}
	/>
</section>

<style>
	h1 {
		color: #e1563f;
		font-size: 64px;
		font-weight: 400;
		margin: 0;
		text-align: center;
		padding-top: 48px;
		padding-bottom: 48px;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}
</style>
