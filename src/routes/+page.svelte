<script lang="ts">
	import { enhance } from '$app/forms';
	import Announcements from '$lib/components/announcements.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	//import SvelteMarkdown from 'svelte-markdown';
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
<div class="bg-img-2" />
<div class="bg-img">
	<div class="announcement-container">
		{#if data.user !== undefined}
			<!--<SvelteMarkdown source={data.settings.homepageText} />-->

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
	.announcement-container {
		padding: 0 20px;
		flex-wrap: wrap;
		max-width: 75rem;
		margin: auto;
	}
	.bg-img {
		background-color: #1d1d1c;
		background-size: 110%;
		min-height: 100vh;
	}

	.bg-img-2 {
		/* Helps Cover a white bar appearing on top of announcements */
		/* We can edit colors as we like by editing the .svg itself in VSCode */
		background-color: #1d1d1c;
		background-repeat: repeat;
		background-size: cover;
		filter: blur(0.05rem);

		/* Absolute position so we can shift it to cover the whole screen */
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;

		/* display under all elements */
		z-index: -1;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}
	.announcementHeader {
		text-align: center;
		font-family: 'Zen Dots';
		font-size: 65px;
		width: 100%;

		white-space: nowrap;
		margin: 0 auto;
		margin-top: 20px;
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
			margin-top: 0px;
			font-size: 50px;
			line-height: 100px;
			margin-bottom: -20px;
		}
		@media screen and (max-width: 740px) {
			.announcementHeader {
				font-size: 35px;
				line-height: 100px;
				margin-bottom: -30px;
			}
			@media screen and (max-width: 480px) {
				.announcementHeader {
					font-size: 20px;
					line-height: 70px;
					margin-bottom: -40px;
				}
			}
		}
	}
</style>
