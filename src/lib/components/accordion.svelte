<script lang="ts">
	export let open = false;
	import { slide } from 'svelte/transition';

	function handleClick(): void {
		open = !open;
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') handleClick();
	}
</script>

<div class="accordion">
	<div class="header" on:click={handleClick} on:keydown={handleKeyDown}>
		<span class="sign">{open ? '-' : '+'}</span>
		<span class="text">
			<slot name="head" />
		</span>
	</div>

	{#if open}
		<div class="details" transition:slide>
			<slot name="details" />
		</div>
	{/if}
</div>

<style>
	.accordion {
		margin-bottom: 2rem;
		color: var(--highlight-color);
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
		padding: 0.5rem;
		color: #7d7a72;
	}
</style>
