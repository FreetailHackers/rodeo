<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Verify Email</title>
</svelte:head>

<div class="topographic-background">
	<div class="top-margin">
		{#if data.success}
			<p>Your email has been successfully verified! You can close this window now.</p>
		{:else}
			<p>This verification link either never existed or expired.</p>
		{/if}
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
