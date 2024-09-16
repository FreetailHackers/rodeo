<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import SocialLogin from '$lib/components/social-login.svelte';

	export let data;

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
<main>
	<div class="auth-content">
		<img class="bat" src="/auth-assets/bat.svg" alt="Freetail Bat" />
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
	h1 {
		text-align: center;
	}

	.forgot-password {
		margin-top: 0.5em;
		text-align: right;
	}

	p {
		margin: 0;
	}

	label,
	.register {
		margin-top: 0.5em;
	}

	.register {
		text-align: center;
		color: var(--accent);
	}
</style>
