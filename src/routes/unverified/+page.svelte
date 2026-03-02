<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Rodeo | Unverified Email</title>
</svelte:head>
<main class="vert-center">
	<div class="auth-content">
		<p class="main-text">
			You must verify your email address <strong>{data.email}</strong> before accessing this page. Please
			check your inbox for a verification link. If you did not get one (remember to check spam), you can
			request a new one below.
		</p>

		{#if form}
			<p class="success-message">{form}</p>
		{/if}

		<div class="button-wrapper">
			<form method="POST" action="?/resend" use:enhance>
				<button type="submit" class="user-button">Resend Verification Email</button>
			</form>
		</div>

		<div class="button-wrapper">
			<form method="POST" action="?/logout" use:enhance>
				<button type="submit" class="secondary-button"> Back to Login </button>
			</form>
		</div>
	</div>
</main>

<style>
	main {
		background: linear-gradient(to bottom, var(--sky-blue), var(--white));
		min-height: 100vh;
	}

	p {
		color: var(--accent);
		margin-bottom: 1em;
	}

	.main-text {
		font-size: 1.2em;
		text-align: center;
	}

	strong {
		color: var(--accent);
	}

	.success-message {
		color: #16a34a;
		margin-bottom: 1em;
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
		border: none !important;
		cursor: pointer;
	}

	.user-button:hover {
		background-color: var(--accent);
		color: var(--white);
		opacity: 0.9;
		border: none !important;
	}

	.secondary-button {
		background-color: var(--white);
		color: var(--accent);
		border: 1px solid var(--accent) !important;
		border-radius: 25px;
		padding: 0.75em 2em;
		cursor: pointer;
		width: auto;
		min-width: 100px;
	}

	.secondary-button:hover {
		background-color: var(--white);
		color: var(--accent);
		border: 1px solid var(--accent) !important;
		opacity: 0.95;
	}
</style>
