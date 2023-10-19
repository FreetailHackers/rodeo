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
	<button type="button" class:selected={!previewing} on:click={() => (previewing = false)}
		>Write</button
	>
	<button type="button" class:selected={previewing} on:click={() => (previewing = true)}
		>Preview</button
	>
</div>
{#if previewing}
	<div class="border">
		{#if value === ''}
			<p class="empty-preview">Nothing to preview.</p>
		{:else}
			<SvelteMarkdown source={value} />
		{/if}
	</div>
	<textarea style="display: none" {id} {name} {required} {value} />
{:else}
	<textarea {id} {name} {placeholder} {required} {rows} bind:value bind:this={textarea} />
{/if}

<style>
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
</style>
