<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements-2024-spring.svelte';
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
<div class="bg-img">
	<div class="container">
		{#if data.user !== undefined}
			<SvelteMarkdown source={data.settings.homepageText} />

			<form method="POST" action="?/logout" use:enhance>
				<button type="submit" id="logout">Logout</button>
			</form>
			<!-- Admin announcements panel -->
			<div class="header-container">
				<h1 class="announcementHeader">ANNOUNCEMENTS</h1>
			</div>
			<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
		{:else}
			<!-- Signup page -->
			{#if !data.canApply}
				<p>
					<b>
						NOTE: Applications are closed. If you would like to be notified of future events, you
						may enter your email below to subscribe to our mailing list.
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
			<div class="header-container">
				<h1 class="announcementHeader">ANNOUNCEMENTS</h1>
			</div>
			<Announcements announcements={data.announcements} admin={false} />
		{/if}
	</div>
</div>

<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />

<style>
	.container {
		padding: 0 20px;
		display: center;
		margin-left: auto;
		margin-right: auto;
	}
	.bg-img {
		background-color: #1d1d1c;
		background-image: url('announcement-images/background.svg');
		background-size: 110%;
		min-height: 100vh;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}
	.announcementHeader {
		text-align: center;
		font-family: 'Zen Dots';
		font-size: 65px; /* Default font size */
		white-space: nowrap; /* Ensure header remains on one line */
		margin: 0 auto; /* Center the header horizontally */
		padding: 0 20px;
	}
	.header-container {
		color: #e1563f;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		font-weight: 400;
	}
	@media screen and (max-width: 1024px) {
		.announcementHeader {
			font-size: 50px;
			line-height: 100px;
		}
		@media screen and (max-width: 768px) {
			.announcementHeader {
				font-size: 30px;
				line-height: 100px;
			}
			@media screen and (max-width: 480px) {
				.announcementHeader {
					font-size: 15px;
					line-height: 70px;
				}
			}
		}
	}
</style>
