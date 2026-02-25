<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import SocialLogin from '$lib/components/social-login.svelte';

	let { data } = $props();

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
	<script src="https://apis.google.com/js/platform.js" async defer></script>
</svelte:head>
<main class="vert-center">
	<div class="auth-content">
		<img class="mascot" src="/auth-assets/logo.png" alt="RecordHacks Mascot" />
		<h1>Login</h1>
		<div class="socials">
			<SocialLogin providers={data.providers} />
		</div>

		<hr />

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
			<input placeholder="Email" id="email" name="email" required autocomplete="username" />

			<label for="password">Password</label>
			<input
				type="password"
				placeholder="Password"
				id="password"
				name="password"
				autocomplete="current-password"
			/>
			<p class="forgot-password"><a href="/login/reset-password">Forgot password?</a></p>

			<div class="button-wrapper">
				<button class="user-button">Login</button>
			</div>
		</form>
		<p class="register">Don't have an account yet? <a href="/register">Sign up here!</a></p>
	</div>
</main>

<style>
	main {
		background: linear-gradient(to bottom, var(--sky-blue), var(--white));
		min-height: 100vh;
	}

	h1 {
		text-align: center;
		color: var(--accent);
	}

	.forgot-password {
		margin-top: 0.5em;
		text-align: right;
	}

	.forgot-password a {
		color: var(--accent);
		text-decoration: underline;
	}

	p {
		margin: 0;
	}

	label {
		color: var(--accent);
		margin-top: 0.5em;
	}

	.register {
		text-align: center;
		color: var(--accent);
	}

	.register a {
		color: var(--accent);
		text-decoration: underline;
	}

	input {
		background-color: var(--white);
		border: 1px solid var(--accent);
		border-radius: 25px;
		color: var(--accent);
	}

	input::placeholder {
		color: var(--grey);
	}

	.button-wrapper {
		display: flex;
		justify-content: center;
		margin-bottom: 1em;
	}

	.user-button {
		background-color: var(--accent);
		color: var(--white);
		border-radius: 25px;
		width: auto;
		min-width: 100px;
		padding: 0.75em 2em;
	}

	.user-button:hover {
		background-color: var(--accent);
		color: var(--white);
		opacity: 0.9;
	}
</style>
