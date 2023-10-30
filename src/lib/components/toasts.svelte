<script lang="ts">
	import { fly, scale } from 'svelte/transition';
	import { toasts } from '$lib/stores';
</script>

<ol id="toasts">
	{#each $toasts as toast (toast.id)}
		<li in:fly={{ x: 1000, duration: 500 }} out:scale class="toast">
			{toast.message}
		</li>
	{/each}
</ol>

<style>
	#toasts {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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
		padding: 1rem;
		background-color: white;
		border: 2px solid black;
	}
</style>
