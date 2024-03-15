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
	<div class="header">
		<h1>Register</h1>
	</div>
	<div class="socials">
		<SocialLogin providers={data.providers} />
	</div>
	<div class="form">
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
	</div>
	<div class="login">
		<p>Already have an account?</p>
		<!-- svelte-ignore a11y-missing-content -->
		<a href="/login">
			<button class="login-button">Login Here!</button>
		</a>
	</div>
</div>

<style>
	.login {
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

	.login-button {
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
		min-height: calc(100vh - 159px);
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
		.login {
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
		.topographic-background {
			min-height: calc(100vh - 56px);
		}
	}
</style>
