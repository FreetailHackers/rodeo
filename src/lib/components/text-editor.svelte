<script lang="ts">
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let name: string;
	export let id = name;
	export let required = false;
	export let placeholder = '';
	export let rows = 5;
	export let value = '';

	let previewing = false;
	let textarea: HTMLTextAreaElement;

	export let useAnnouncementFont: boolean = false;
	export let isHTML: boolean;

	// HACK: This is a workaround for Svelte not updating input bindings a form is reset
	onMount(() => {
		textarea.form?.addEventListener('reset', () => {
			value = '';
			// We might as well switch back to write mode for good measure
			previewing = false;
		});
	});
</script>

{#if previewing}
	<div class="border white-preview-background">
		{#if value === ''}
			<p class:announcement-font={useAnnouncementFont} class="empty-preview">Nothing to preview.</p>
		{:else}
			<div class:announcement-font={useAnnouncementFont}>
				{#if isHTML}
					{@html value}
				{:else}
					<SvelteMarkdown source={value} />
				{/if}
			</div>
		{/if}
	</div>
	<textarea
		class:announcement-font={useAnnouncementFont}
		style="display: none;"
		{id}
		{name}
		{required}
		{value}
	/>
{:else}
	<textarea
		class:announcement-font={useAnnouncementFont}
		{id}
		{name}
		{placeholder}
		{required}
		{rows}
		bind:value
		bind:this={textarea}
	/>
{/if}

<div id="preview-button">
	<button
		class:announcement-font={useAnnouncementFont}
		type="button"
		class:selected={previewing}
		on:click={() => (previewing = !previewing)}>Preview</button
	>
</div>

<style>
	.white-preview-background {
		background: white;
	}

	textarea {
		height: auto;
		width: 100%;
	}

	.border {
		border: 1px solid var(--grey);
		border-radius: var(--border-radius);
		padding: 0 1rem;
		min-height: 3rem;
	}

	#preview-button {
		display: flex;
		justify-content: flex-end;
		margin: 0.5em 0;
	}

	button {
		background-color: var(--light-grey);
		color: var(--black);
	}

	.selected {
		background-color: var(--accent);
		color: var(--white);
	}

	.empty-preview {
		color: gray;
		font-style: italic;
	}
</style>
