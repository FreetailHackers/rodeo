<script lang="ts">
	import { enhance } from '$app/forms';
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
	<title>Rodeo | Login</title>
</svelte:head>

<div class="topographic-background">
	<div class="header">
		<h1>Login</h1>
	</div>
	<div class="socials">
		<SocialLogin providers={data.providers} />
	</div>
	<div class="form">
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
	</div>
</div>

<style>
	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		background-size: 110%;
	}

	.header {
		color: #f2ebd9;
		margin-top: 4vw;
		width: 40%;
		text-align: left;
		font-size: 2vw;
	}

	label {
		display: block;
		color: #1c1c1c;
		margin-top: 1vw;
		margin-bottom: 0.1vw;
	}

	input {
		display: block;
		border-width: 1px;
	}

	button {
		margin-top: 2vw;
		margin-bottom: 0.5vw;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}

	.form {
		width: 40%;
		padding-left: 0.5vw;
		padding-right: 0.5vw;
		margin-bottom: 10vw;
		background-color: #f2ebd9;
	}

	p {
		font-size: 1vw;
	}

	@media (max-width: 768px) {
		.form,
		.socials,
		.header {
			width: 60%;
		}
		.header {
			font-size: 4vw;
		}

		input,
		label,
		button {
			font-size: 3vw;
		}

		.form {
			padding-left: 0.5vw;
			padding-right: 0.5vw;
		}

		label {
			margin-top: 0.5vw;
		}

		button {
			margin-top: 2vw;
			margin-bottom: 0.5vw;
		}

		p {
			font-size: 2vw;
		}
	}

	.socials {
		width: 40%;
	}
</style>
