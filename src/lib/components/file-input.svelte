<script lang="ts">
	interface Props {
		name: string;
		id?: any;
		selectedFile: string | undefined;
		accept: string;
		maxSizeMB: number;
	}

	let { name, id = name, selectedFile = $bindable(), accept, maxSizeMB }: Props = $props();

	let input = $state() as HTMLInputElement;
	let tooBig = $state(false);
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
		height: 100%;
		margin-left: 0.5em;
		/* Needed to make the button activate the file picker for some reason */
		pointer-events: none;
	}

	span {
		align-self: center;
	}

	input {
		display: none;
	}

	.empty {
		color: var(--grey);
	}

	.error {
		color: red;
	}
</style>
