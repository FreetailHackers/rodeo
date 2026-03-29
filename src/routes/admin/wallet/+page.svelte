<script lang="ts">
  let stripFile: File | null = null;
  let passFile: File | null = null;
  let dragging = false;

  function handleFiles(files: FileList) {
    for (const file of files) {
      if (file.name === "strip.png") {
        stripFile = file;
      } else if (file.name === "pass.json") {
        passFile = file;
      } else {
        alert(`Invalid file: ${file.name}`);
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

  async function upload() {
    if (!stripFile && !passFile) {
      alert("Please upload at least one file.");
      return;
    }

    const formData = new FormData();

    if (stripFile) formData.append("stripFile", stripFile);
    if (passFile) formData.append("passFile", passFile);

    try {
      const res = await fetch("/api/upload-wallet-pass", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error();

      alert("Upload successful!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }
</script>

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
</style>

<div class="main-content">
  <h2>Wallet Pass Upload</h2>

  <div
    class="dropzone {dragging ? 'dragging' : ''}"
    on:dragover|preventDefault={() => (dragging = true)}
    on:dragleave={() => (dragging = false)}
    on:drop={handleDrop}
    on:click={() => document.getElementById("fileInput")?.click()}
  >
    <div class="row">
      <b>Upload Files</b>
    </div>
    <div class="muted">
      Drag & drop <b>strip.png</b> or <b>pass.json</b> here  
      <br />
      or click to select files
    </div>

    <input
      id="fileInput"
      type="file"
      multiple
      style="display: none"
      on:change={handleFileInput}
    />
  </div>

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

  <div class="row" style="margin-top: 1rem;">
    <button class="small-btn" on:click={upload}>
      Upload
    </button>
  </div>
</div>