<script lang="ts">
	export let isOpen = false;
	import { slide } from 'svelte/transition';

	function handleClick(): void {
		isOpen = !isOpen;
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') handleClick();
	}
</script>

<div class="accordion">
	<div class="header" on:click={handleClick} on:keydown={handleKeyDown}>
		<span class="text">
			<slot name="head" />
		</span>
		<span>{isOpen ? '-' : '+'}</span>
	</div>

	<hr />

	{#if isOpen}
		<div class="details" transition:slide>
			<slot name="details" />
		</div>
	{/if}
</div>

<style>
	.accordion,
	.header,
	.details {
		color: var(--primary-accent);
	}

	.header {
		display: flex;
		width: 100%;
	}

	.header .text {
		flex: 1;
	}

	.text,
	.accordion {
		padding-bottom: 0.5rem;
	}

	.details {
		overflow: hidden;
	}
</style>
