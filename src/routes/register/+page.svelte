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
	<SocialLogin providers={data.providers} />
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

<style>
	label,
	.login {
		padding-top: 15px;
	}

	.login {
		display: flex;
		text-align: center;
		align-items: center;
	}

	.login-button {
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
