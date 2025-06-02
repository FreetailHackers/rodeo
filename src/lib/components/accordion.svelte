<script lang="ts">
	import { slide } from 'svelte/transition';
	interface Props {
		open?: boolean;
		head?: import('svelte').Snippet;
		details?: import('svelte').Snippet;
	}

	let { open = $bindable(false), head, details }: Props = $props();

	function handleClick(): void {
		open = !open;
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter') handleClick();
	}
</script>

<div class="accordion">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="header" onclick={handleClick} onkeydown={handleKeyDown}>
		<span class="sign">{open ? '-' : '+'}</span>
		<span class="text">
			{@render head?.()}
		</span>
	</div>

	{#if open}
		<div class="details" transition:slide|global>
			{@render details?.()}
		</div>
	{/if}
</div>

<style>
	.accordion {
		margin-bottom: 2rem;
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
	}
</style>
