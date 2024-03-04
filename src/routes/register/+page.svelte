<script lang="ts">
	import { enhance } from '$app/forms';
	import SocialLogin from '$lib/components/social-login.svelte';

	export let data;

	let hidden = true;
</script>

<svelte:head>
	<title>Rodeo | Register</title>
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
		<p>
			Already have an account? <a href="/login">Login here!</a>
		</p>
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
	}

	.header {
		color: #f2ebd9;
		margin-top: 4vw;
		width: 40%;
		text-align: left;
		font-size: 180%;
	}

	label {
		display: block;
		color: #1c1c1c;
		margin-top: 1vw;
		margin-bottom: 0.1vw;
	}

	input {
		display: block;
		border-width: 1px;
	}

	.inputValues {
		background-color: #f2ebd9;
		color: #404040;
	}

	button {
		margin-top: 2vw;
		box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
	}

	.form {
		width: 40%;
		padding-left: 0.5vw;
		padding-right: 0.5vw;
		margin-bottom: 10vw;
		background-color: #f2ebd9;
	}

	p {
		font-size: 90%;
	}

	@media (max-width: 1000px) {
		.header {
			font-size: 150%;
		}
	}

	@media (max-width: 850px) {
		.header {
			font-size: 120%;
		}
	}

	@media (max-width: 768px) {
		.form,
		.socials,
		.header {
			width: 60%;
		}
		.header {
			font-size: 4vw;
		}

		input,
		label,
		button {
			font-size: 3vw;
		}

		.form {
			padding-left: 0.5vw;
			padding-right: 0.5vw;
		}

		label {
			margin-top: 0.5vw;
		}

		button {
			margin-top: 2vw;
			margin-bottom: 0.5vw;
		}

		p {
			font-size: 2vw;
		}
	}

	.socials {
		width: 40%;
	}
</style>
