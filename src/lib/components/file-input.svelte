<script lang="ts">
	interface Props {
		name: string;
		id?: any;
		selectedFile: string | undefined;
		accept: string;
		maxSizeMB: number;
	}

	let { name, id = name, selectedFile = $bindable(), accept, maxSizeMB }: Props = $props();

	let input: HTMLInputElement | undefined = $state();
	let tooBig = $state(false);
	function checkSize() {
		if (input) {
			if (input.files?.[0]) {
				if (input.files[0].size > maxSizeMB * 1024 * 1024) {
					input.value = '';
					tooBig = true;
					selectedFile = undefined;
				} else {
					tooBig = false;
					selectedFile = input.files[0].name;
				}
			}
		}
	}
</script>

<div>
	<label for={id}><button type="button">Choose File...</button></label>
	{#if tooBig}
		<span class="error">File too big! Max size is {maxSizeMB} MB.</span>
	{:else}
		<span class:empty={!selectedFile}
			>{selectedFile ?? (accept ? 'Allowed types are ' + accept : 'No file selected')}</span
		>
	{/if}
	<input type="file" {id} {name} {accept} bind:this={input} onchange={checkSize} />
</div>

<style>
	div {
		display: flex;
		align-items: stretch;
		gap: 1rem;
		border: 2px solid gray;
	}

	label {
		cursor: pointer;
	}

	button {
		width: 8rem;
		height: 100%;
		/* Needed to make the button activate the file picker for some reason */
		pointer-events: none;
	}

	span {
		padding: 0.5rem 0;
	}

	input {
		display: none;
	}

	.empty {
		color: gray;
	}

	.error {
		color: red;
	}
</style>
