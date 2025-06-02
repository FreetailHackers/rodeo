<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import { toasts } from '$lib/stores';

	let { data } = $props();

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			if (input.files[0].size > 1024 * 1024) {
				toasts.notify('Error: File size must be under 1MB.');
			}
		}
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Sponsor</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit Sponsor</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.id} />
			<button
				use:confirmationDialog={{
					text: 'Are you sure you want to delete this sponsor?',
					cancel: 'Cancel',
					ok: 'Delete',
				}}>Delete Sponsor</button
			>
		</form>
	</div>

	<form
		method="POST"
		action="?/edit"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="id" value={data.id} />
		<label for="name">Name</label>
		<input type="text" id="name" name="name" value={data.name} />

		<img src={data.imageUrl} alt={data.name} />

		<label for="logo">Logo</label>
		<input
			type="file"
			id="logo"
			name="logo"
			accept=".jpg, .jpeg, .png, .webp"
			onchange={handleFileChange}
		/>

		<label for="link">Link</label>
		<input type="url" id="link" name="link" value={data.url} />

		<button type="submit">Save</button>
	</form>
</div>

<style>
	#header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	input,
	form {
		margin-bottom: 0.5rem;
	}

	button {
		margin-top: 1rem;
	}
</style>
