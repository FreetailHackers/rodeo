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

<!-- lores MLH badge-->
<div class="show-small">
	<a
		id="mlh-trust-badge-small"
		href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=black"
		target="_blank"
		rel="noreferrer"
		><img
			src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-black.svg"
			alt="Major League Hacking 2024 Hackathon Season"
			id="mlh-badge-image"
		/></a
	>
</div>

<svelte:head>
	<title>Rodeo | Home</title>
</svelte:head>

<!-- hires MLH badge-->
<div class="show-large">
	<a
		id="mlh-trust-badge-large"
		href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=black"
		target="_blank"
		rel="noreferrer"
		><img
			src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-black.svg"
			alt="Major League Hacking 2024 Hackathon Season"
			id="mlh-badge-image"
		/></a
	>
</div>
<div class="show-small"><br /></div>

{#if data.user !== undefined}
	<SvelteMarkdown source={data.settings.homepageText} />

	<form method="POST" action="?/logout" use:enhance>
		<button type="submit" id="logout">Logout</button>
	</form>
	<!-- Admin announcements panel -->
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
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
{/if}

<style>
	#mlh-trust-badge-small {
		display: block;
		max-width: 6rem;
		min-width: 3.75rem;
		position: fixed;
		right: 5px;
		top: 0;
		width: 10%;
		z-index: 10000;
	}

	#mlh-trust-badge-large {
		display: block;
		max-width: 6rem;
		min-width: 6rem;
		position: fixed;
		right: 6vw;
		top: 56px;
		width: 10%;
		z-index: 10000;
	}

	#mlh-badge-image {
		width: 100%;
	}

	.show-small {
		display: none;
	}
	.show-large {
		display: contents;
	}

	@media (max-width: 1089px) {
		.show-small {
			display: contents;
		}

		.show-large {
			display: none;
		}

		#mlh-trust-badge-small {
			max-width: 3.75rem;
		}
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
