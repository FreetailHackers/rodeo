<script>
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Formula Hacks | Unverified Email</title>
</svelte:head>

<div class="topographic-background">
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
