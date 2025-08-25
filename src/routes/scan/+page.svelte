<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Rodeo | Scan</title>
</svelte:head>

<div class="main-content">
	<h1>Scan</h1>
	<hr />
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
	hr {
		margin-bottom: 2rem;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	button {
		width: 100%;
	}

	section {
		color: var(--accent); /* changed for dark mode */
	}
</style>
