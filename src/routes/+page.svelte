<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import Schedule from '$lib/components/schedule.svelte';
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
	<h2>Sponsors</h2>
	<div class="image">
		<img alt="The project logo" src={'src/lib/assets/sponsors/Capital One Logo.png'} />
		<img alt="The project logo" src={'src/lib/assets/sponsors/mercury_financial.jpeg'} />
		<img alt="The project logo" src={'src/lib/assets/sponsors/Roblox Logo.png'} />
	</div>
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
	<h2>Sponsors</h2>
	<div class="image">
		<img alt="The project logo" src={'src/lib/assets/sponsors/Capital One Logo.png'} />
		<img alt="The project logo" src={'src/lib/assets/sponsors/mercury_financial.jpeg'} />
		<img alt="The project logo" src={'src/lib/assets/sponsors/Roblox Logo.png'} />
	</div>
{/if}

<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />

<style>
	img {
		width: 200px;
		height: auto;
		padding-bottom: 2%;
		padding-top: 2%;
	}

	.image {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		align-items: center;
		width: 100%;
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
