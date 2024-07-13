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

	// HACK: This is a workaround for Svelte not updating input bindings a form is reset
	onMount(() => {
		textarea.form?.addEventListener('reset', () => {
			value = '';
			// We might as well switch back to write mode for good measure
			previewing = false;
		});
	});
</script>

<div>
	<button
		class:announcement-font={useAnnouncementFont}
		type="button"
		class:selected={!previewing}
		on:click={() => (previewing = false)}>Write</button
	>
	<button
		class:announcement-font={useAnnouncementFont}
		type="button"
		class:selected={previewing}
		on:click={() => (previewing = true)}>Preview</button
	>
</div>
{#if previewing}
	<div class="border white-preview-background">
		{#if value === ''}
			<p class:announcement-font={useAnnouncementFont} class="empty-preview">Nothing to preview.</p>
		{:else}
			<div class:announcement-font={useAnnouncementFont}>
				<SvelteMarkdown source={value} />
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

<style>
	.white-preview-background {
		background: white;
	}
	button {
		padding: 0 1rem;
		background-color: #ddd;
		color: black;
	}
	textarea {
		height: auto;
		width: 100%;
	}

	.border {
		border: 2px solid gray;
		padding: 0 1rem;
		min-height: 3rem;
	}

	.selected {
		text-decoration: underline;
	}

	.empty-preview {
		color: gray;
		font-style: italic;
	}

	.announcement-font {
		font-family: 'Fugaz One';
		font-weight: 400;
		color: #000000;
	}
</style>
