<script lang="ts">
	export let name: string;
	export let id = name;
	export let selectedFile: string | undefined;
	export let accept: string;
	export let maxSizeMB: number;

	let input: HTMLInputElement;
	let tooBig = false;
	function checkSize() {
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
	<input type="file" {id} {name} {accept} bind:this={input} on:change={checkSize} />
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
