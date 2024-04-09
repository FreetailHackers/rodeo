<script lang="ts">
	import { enhance } from '$app/forms';
	import SocialLogin from '$lib/components/social-login.svelte';

	export let data;

	let hidden = true;
</script>

<svelte:head>
	<title>Formula Hacks | Register</title>
</svelte:head>

<div class="topographic-background">
	<div class="main-content">
		<h1>Register</h1>
		<div class="socials">
			<SocialLogin providers={data.providers} />
		</div>
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
			<!-- svelte-ignore a11y-invalid-attribute -->
			<label for="password">
				Password (<a href="javascript:;" on:click={() => (hidden = !hidden)}>
					{#if hidden}show{:else}hide{/if}</a
				>)
			</label>
			<input
				class="inputValues"
				placeholder="Password"
				type={hidden ? 'password' : 'text'}
				id="password"
				name="password"
				required
				minlength="8"
				autocomplete="new-password"
			/>
			<button>Continue</button>
		</form>
		<div class="login">
			<p>Already have an account?</p>
			<!-- svelte-ignore a11y-missing-content -->
			<a href="/login">
				<button class="login-button">Login Here!</button>
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
	.login {
		background-color: var(--highlight-color);
		width: clamp(25rem, 30vw, 50rem);
	}

	form {
		padding: 0em 1em 1em 1em;
	}

	.login {
		display: flex;
		text-align: center;
		align-items: center;
		justify-content: space-between;
		padding: 0.5em 1em;
		margin: 1em 0 15px 0;
	}

	.login-button {
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
		.login {
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
