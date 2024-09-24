<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Verify Email</title>
</svelte:head>

<div class="auth-content">
	<img class="bat" src="/auth-assets/bat.svg" alt="Freetail Bat" />
	{#if data.success}
		<p>Your email has been successfully verified! You can close this window now.</p>
	{:else}
		<p>This verification link either never existed or expired.</p>
	{/if}
</div>
