<script lang="ts">
	import { enhance } from '$app/forms';
	import SocialLogin from '$lib/components/social-login.svelte';

	let { data } = $props();

	let hidden = $state(true);
</script>

<svelte:head>
	<title>Rodeo | Register</title>
</svelte:head>
<main class="vert-center">
	<div class="auth-content">
		<img class="mascot" src="/auth-assets/logo.png" alt="HackTX Mascot" />
		<h1>Register</h1>
		<div class="socials">
			<SocialLogin providers={data.providers} />
		</div>
		<hr />
		<form
			method="POST"
			use:enhance={() => {
				return async ({ update }) => {
					update({ reset: false });
				};
			}}
		>
			<label for="email">Email</label>
			<input
				type="email"
				id="email"
				name="email"
				placeholder="Email"
				class="inputValues"
				autocomplete="username"
			/>
			<!-- svelte-ignore a11y_invalid_attribute -->
			<label for="password">
				Password (<a href="javascript:;" onclick={() => (hidden = !hidden)}>
					{#if hidden}show{:else}hide{/if}</a
				>)
			</label>
			<input
				placeholder="Password"
				type={hidden ? 'password' : 'text'}
				id="password"
				name="password"
				required
				minlength="8"
				autocomplete="new-password"
			/>
			<div class="button-wrapper">
				<button class="user-button">Register</button>
			</div>
		</form>
		<p class="login">Already have an account? <a href="/login">Login here!</a></p>
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

	p {
		margin: 0;
	}

	label {
		color: var(--accent);
		margin-top: 0.5em;
	}

	label a {
		color: var(--accent);
		text-decoration: underline;
	}

	.login {
		text-align: center;
		color: var(--accent);
		margin-top: 1em;
	}

	.login a {
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
