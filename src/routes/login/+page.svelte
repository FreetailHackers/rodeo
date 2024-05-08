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

<div class="main-content">
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
		<input
			class="inputValues"
			placeholder="Enter your email address"
			id="email"
			name="email"
			required
			autocomplete="username"
		/>
		<label for="password">Password (<a href="/login/reset-password">forgot?</a>)</label>
		<!-- HACK: Not required so we can easily log into test accounts lol -->
		<input
			class="inputValues"
			type="password"
			placeholder="Enter your password"
			id="password"
			name="password"
			autocomplete="current-password"
		/>
		<button>Sign in with Email</button>
	</form>
	<div class="register">
		<p>Don't have an account yet?</p>
		<!-- svelte-ignore a11y-missing-content -->
		<a href="/register">
			<button class="register-button">Register Here!</button>
		</a>
	</div>
</div>

<style>
	label,
	.register {
		padding-top: 15px;
	}

	.register {
		display: flex;
		text-align: center;
		align-items: center;
	}

	.register-button {
		margin: 0;
		margin-left: 15px;
		padding: 0px 15px;
	}

	input {
		display: block;
		border-width: 1px;
	}

	button {
		margin-top: 15px;
		box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
		-moz-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
		-webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
	}

	.inputValues {
		background-color: var(--background-color);
	}
</style>
