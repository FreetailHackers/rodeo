<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Rodeo | Unverified Email</title>
</svelte:head>
<div class="vert-center">
	<div class="auth-content">
		<p>
			You must verify your email address <strong>{data.email}</strong> before accessing this page. Please
			check your inbox for a verification link. If you did not get one (remember to check spam), you
			can request a new one below.
		</p>

		{#if form}
			<p style="color: green">{form}</p>
		{/if}

		<form method="POST" action="?/resend" use:enhance>
			<button type="submit">Resend Verification Email</button>
		</form>

		<form method="POST" action="?/logout" use:enhance style="margin-top: 1rem;">
			<button
				type="submit"
				style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;"
			>
				Back to Login
			</button>
		</form>
	</div>
</div>
