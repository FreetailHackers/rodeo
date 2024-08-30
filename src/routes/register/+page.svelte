<script lang="ts">
	import { enhance } from '$app/forms';
	import SocialLogin from '$lib/components/social-login.svelte';

	export let data;

	let hidden = true;
</script>

<svelte:head>
	<title>Rodeo | Register</title>
</svelte:head>

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
			placeholder="Password"
			type={hidden ? 'password' : 'text'}
			id="password"
			name="password"
			required
			minlength="8"
			autocomplete="new-password"
		/>
		<div class="button-wrapper">
			<button>Register</button>
		</div>
	</form>
	<p class="login">Already have an account? <a href="/login">Login here!</a></p>
</div>

<style>
	h1,
	.button-wrapper {
		text-align: center;
	}

	.button-wrapper {
		margin-top: 1em;
	}

	p {
		margin: 0;
	}

	label,
	.login {
		margin-top: 0.5em;
	}

	input,
	button {
		border-radius: 15px;
	}

	input {
		color: grey;
		border-width: 1px;
	}

	button {
		padding: 0.5em 1.5em;
	}

	.login {
		text-align: center;
	}
</style>
