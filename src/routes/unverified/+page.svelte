<script>
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Rodeo | Unverified Email</title>
</svelte:head>

<div class="top-margin">
	<p>
		You must verify your email before accessing this page. Please check your inbox for a
		verification link. If you did not get one (remember to check spam), you can request a new one
		below.
	</p>
	<form method="POST" use:enhance>
		<button type="submit">Resend Verification Email</button>
	</form>
</div>

<style>
	.top-margin {
		width: 75%;
		align-items: center;
		color: #f2ebd9;
		margin-top: 4rem;
	}

	@media (max-width: 768px) {
		.topographic-background {
			min-height: calc(100vh - 56px);
		}
	}
</style>
