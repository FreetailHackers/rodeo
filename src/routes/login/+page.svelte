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
	</div>
	<div class="register">
		<p>Don't have an account yet?</p>
		<!-- svelte-ignore a11y-missing-content -->
		<a href="/register">
			<button class="register-button">Register Here!</button>
		</a>
	</div>
</div>

<style>
	.register {
		background: #f2ebd9;
		display: flex;
		flex-wrap: wrap;
		text-align: center;
		align-items: center;
		justify-content: space-around;
		width: 40%;
		padding: 0.5em 1em;
		margin-top: 1em;
	}

	.register-button {
		min-width: 15em;
		flex-grow: 1;
	}

	p {
		margin: 0;
		margin-bottom: 0.5em;
		padding-top: 0.5em;
		flex-grow: 1;
	}

	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		background-size: 110%;
		min-height: 100vh;
	}

	.header {
		color: #f2ebd9;
		margin-top: 4rem;
		width: 40%;
		text-align: left;
		font-size: 180%;
	}

	label {
		color: #1c1c1c;
		padding-top: 0.5em;
	}

	input {
		display: block;
		border-width: 1px;
		margin-bottom: 0.5em;
	}

	button {
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}

	.form {
		width: 40%;
		padding: 0em 1em 1em 1em;
		background-color: #f2ebd9;
	}

	.inputValues {
		background-color: #f2ebd9;
		color: #404040;
	}

	.socials {
		width: 40%;
	}

	@media (max-width: 768px) {
		.form,
		.socials,
		.header,
		.register {
			width: 80%;
		}
		.header {
			font-size: 4vw;
		}

		input,
		label,
		button {
			height: 2em;
			font-size: 20px;
		}

		.form {
			padding: 0 1em 1em 1em;
		}

		label {
			margin-top: 0.5vw;
		}

		button {
			margin-top: 0.5vw;
			margin-bottom: 0.5vw;
		}
	}
</style>
