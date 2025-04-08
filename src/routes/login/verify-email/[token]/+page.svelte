<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Verify Email</title>
</svelte:head>

<main class="vert-center">
	<div class="auth-content">
		<img class="mascot" src="/auth-assets/recordhacks-mascot.png" alt="RecordHacks Mascot" />
		{#if data.success}
			<p>Your email has been successfully verified! You can close this window now.</p>
		{:else}
			<p>This verification link either never existed or expired.</p>
		{/if}
	</div>
</main>
