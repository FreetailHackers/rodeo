<script lang="ts">
  export let form;
  let clientError: string | null = null;
	let stripFile: File | null = null;
	let passFile: File | null = null;
	let dragging = false;

	function handleFiles(files: FileList) {
		for (const file of files) {
			if (file.name === 'strip.png') {
				stripFile = file;
			} else if (file.name === 'pass.json') {
				passFile = file;
			} else {
				clientError = `Invalid file: ${file.name}`;
			}
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		if (event.dataTransfer?.files) {
			handleFiles(event.dataTransfer.files);
		}
	}

	function handleFileInput(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			handleFiles(input.files);
		}
	}
</script>

<div class="main-content">
	<h2>Wallet Pass Upload</h2>

	<!-- FORM START -->
	<form method="POST" enctype="multipart/form-data">
		<!-- DROP ZONE -->
		<div
			class="dropzone {dragging ? 'dragging' : ''}"
			on:dragover|preventDefault={() => (dragging = true)}
			on:dragleave={() => (dragging = false)}
			on:drop={handleDrop}
			on:click={() => document.getElementById('fileInput')?.click()}
		>
			<div class="row">
				<b>Upload Files</b>
			</div>
			<div class="muted">
				Drag & drop <b>strip.png</b> or <b>pass.json</b> here
				<br />
				or click to select files
			</div>

			<!-- hidden file input -->
			<input
				id="fileInput"
				type="file"
				name="files"
				multiple
				style="display: none"
				on:change={handleFileInput}
			/>
		</div>
	{#if form?.success === false}
		<div class="error-msg">
			{form.message}
		</div>
	{/if}

	{#if form?.success === true}
	<div class="success-msg">
		{form.message}
	</div>
	{/if}

	{#if clientError}
	<div class="error-msg">
		{clientError}
	</div>
	{/if}

		<!-- FILE STATUS -->
		<div class="grid">
			<div>
				<div class="row">
					<b>Strip Image</b>
				</div>
				{#if stripFile}
					<div class="row">
						<span class="pill">PNG</span>
						<span>{stripFile.name}</span>
					</div>
				{:else}
					<div class="muted">No file selected</div>
				{/if}
			</div>

			<div>
				<div class="row">
					<b>Pass JSON</b>
				</div>
				{#if passFile}
					<div class="row">
						<span class="pill">JSON</span>
						<span>{passFile.name}</span>
					</div>
				{:else}
					<div class="muted">No file selected</div>
				{/if}
			</div>
		</div>

		<!-- SUBMIT BUTTON -->
		<div class="row" style="margin-top: 1rem; margin-bottom: 1rem">
			<button class="small-btn" type="submit" formaction="?/upload"> Upload </button>
		</div>
	</form>
	<!-- FORM END -->
</div>

<style>
	.dropzone {
		border: 2px dashed var(--accent);
		border-radius: 8px;
		padding: 2rem;
		text-align: center;
		cursor: pointer;
		transition: 0.2s;
	}

	.dropzone.dragging {
		background: rgba(0, 128, 128, 0.08);
	}
	.error-msg {
    margin-top: 0.5rem;
    color: red;
    font-size: 0.85rem;
  }

  .success-msg {
    margin-top: 0.5rem;
    color: var(--accent);
    font-size: 0.85rem;
  }
</style>
