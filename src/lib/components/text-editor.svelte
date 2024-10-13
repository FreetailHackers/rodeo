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
			<p class="empty-preview">Nothing to preview.</p>
		{:else}
			<div>
				{#if isHTML}
					{@html value}
				{:else}
					<SvelteMarkdown source={value} />
				{/if}
			</div>
		{/if}
	</div>
	<textarea style="display: none;" {id} {name} {required} {value} />
{:else}
	<textarea {id} {name} {placeholder} {required} {rows} bind:value bind:this={textarea} />
{/if}
<div class="container">
	<div class="toggle-container">
		{#if isHTML}
			<Toggle name={toggleName} isLeft={true} label="HTML" bind:checked={isHTML} />
		{:else}
			<Toggle name={toggleName} isLeft={true} label="Markdown" bind:checked={isHTML} />
		{/if}
	</div>
	<label class="preview-label">
		<span>Preview</span>
		<input type="checkbox" bind:checked={previewing} />
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
		background-color: #ddd;
		color: black;
		transform: translateY(2px);
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
</style>
