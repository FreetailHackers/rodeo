<script lang="ts">
	import BlacklistPanel from '$lib/components/blacklist-panel.svelte';
</script>

<div class="main-content">
	<h1 class="page-title">Blacklist</h1>
	<BlacklistPanel />
</div>

<style>
	.main-content {
		padding: 0 1.25rem;
	}

	@media (min-width: 780px) {
		.main-content {
			padding-left: 2rem;
			padding-right: 2rem;
		}
	}

	.page-title {
		margin: 0.5rem 0 1.5rem;
	}
</style>
