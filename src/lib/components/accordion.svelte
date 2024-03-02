<script lang="ts">
	export let open = false;
	import { slide } from 'svelte/transition';

	function handleClick(): void {
		open = !open;
	}
</script>

<div class="accordion">
	<div class="header">
		<button class="accordion-button" on:click={handleClick}>
			{open ? '-' : '+'}
			<span class="text">
				<slot name="head" />
			</span>
		</button>
	</div>

	{#if open}
		<div class="details" transition:slide>
			<slot name="details" />
		</div>
	{/if}
</div>

<style>
	.accordion {
		margin: 1rem 0;
		color: var(--highlight-color);
	}

	.accordion-button {
		background-color: transparent;
	}

	.header {
		display: flex;
		width: 100%;
	}

	.header .text {
		flex: 1;
		margin-left: 1rem;
	}

	.details {
		padding: 1rem;
	}
</style>
