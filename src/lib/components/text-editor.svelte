<script lang="ts">
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import Toggle from '$lib/components/toggle.svelte';

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
	export let toggleName: string = '';

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
<div class="container">
	<div class="toggle-container">
		<Toggle name={toggleName} label="Use HTML (Default: Markdown)" bind:checked={isHTML} />
	</div>
	<label class="preview-label">
		<input
			class:announcement-font={useAnnouncementFont}
			type="checkbox"
			bind:checked={previewing}
		/>
		<span>Preview</span>
	</label>
</div>

<style>
	.container {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-bottom: 10px;
		margin-top: 5px;
	}

	.toggle-container {
		margin-right: 20px;
	}

	.white-preview-background {
		background: white;
	}

	.preview-label {
		white-space: nowrap;
	}

	input {
		padding: 0 1rem;
		background-color: #ddd;
		color: black;
		margin-right: -5px;
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
