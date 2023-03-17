<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/stores';
</script>

<ol id="toasts">
	{#each $toasts as toast}
		<li in:fly={{ x: 1000, duration: 500 }} class="toast">
			{toast}
		</li>
	{/each}
</ol>

<style>
	#toasts {
		position: fixed;
		bottom: 0;
		right: 0;
		width: 100%;
		max-width: 425px;
		margin: 0;
		padding: 1rem;
		z-index: 100;
		list-style: none;
	}

	.toast {
		position: relative;
		width: 100%;
		margin-top: 0.5rem;
		padding: 1rem;
		background-color: white;
		border: 2px solid black;
	}
</style>
