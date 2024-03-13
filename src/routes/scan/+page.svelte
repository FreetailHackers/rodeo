<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Scan</title>
</svelte:head>

<div class="main-content">
	<section>
		{#if data.scanActions.length === 0}
			<i>No scan actions are configured. Add some in the <a href="/admin">admin panel</a>.</i>
		{/if}
		{#each data.scanActions as action}
			<a href={'/scan/' + action}><button>{action}</button></a>
		{/each}
	</section>
</div>

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	button {
		width: 100%;
	}
</style>
