<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Verify Email</title>
</svelte:head>

<div class="top-margin">
	{#if data.success}
		<p>Your email has been successfully verified! You can close this window now.</p>
	{:else}
		<p>This verification link either never existed or expired.</p>
	{/if}
</div>

<style>
	.top-margin {
		width: 75%;
		align-items: center;
		color: #f2ebd9;
		margin-top: 4rem;
	}
</style>
