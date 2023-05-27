<script lang="ts">
	export let data;
</script>

{#if data.success}
	<p>Your email has been successfully verified! You can close this window now.</p>
{:else}
	<p>This verification link either never existed or expired.</p>
{/if}
