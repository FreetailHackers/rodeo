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
	<title>Formula Hacks | Login</title>
</svelte:head>

<div class="topographic-background">
	<div class="main-content">
		<h1>Login</h1>
		<div class="socials">
			<SocialLogin providers={data.providers} />
		</div>
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
				placeholder="Email"
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
				placeholder="Password"
				id="password"
				name="password"
				autocomplete="current-password"
			/>
			<button>Continue</button>
		</form>
		<div class="register">
			<p>Don't have an account yet?</p>
			<!-- svelte-ignore a11y-missing-content -->
			<a href="/register">
				<button class="register-button">Register Here!</button>
			</a>
		</div>
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
		min-height: calc(100vh - 159px);
	}

	h1 {
		color: var(--highlight-color);
		text-align: center;
		white-space: nowrap;
		font-size: min(12vw, 3.5em);
		margin: 15px 0px;
	}

	p {
		margin: 4px 0;
	}

	form,
	.register {
		background-color: var(--highlight-color);
		width: clamp(25rem, 30vw, 50rem);
	}

	form {
		padding: 0em 1em 1em 1em;
	}

	.register {
		display: flex;
		text-align: center;
		align-items: center;
		justify-content: space-between;
		padding: 0.5em 1em;
		margin: 1em 0 15px 0;
	}

	.register-button {
		margin: 0;
		margin-left: 10px;
		padding: 0px 15px;
	}

	label {
		color: var(--background-color);
		padding-top: 0.5em;
	}

	input {
		display: block;
		border-width: 1px;
	}

	button {
		margin-top: 0.5em;
		box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.25);
		-moz-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
		-webkit-box-shadow: 0 0 5px rgba(0, 0, 0, 0.25);
	}

	.inputValues {
		background-color: var(--highlight-color);
		color: #404040;
	}

	@media (max-width: 768px) {
		.topographic-background {
			min-height: calc(100vh - 56px);
		}

		form,
		.register {
			min-width: 20rem;
			width: 15vw;
		}
	}

	@media (max-width: 1090px) {
		h1 {
			margin-top: 0px;
		}
	}
</style>
