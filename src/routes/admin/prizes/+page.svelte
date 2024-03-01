<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
</script>

<svelte:head>
	<title>Rodeo | Admin - Prize</title>
</svelte:head>

<h2>Create New Prize</h2>
<form method="POST" action="?/create" use:enhance>
	<input type="hidden" name="id" />

	<label for="category">Category</label>
	<input type="text" id="category" name="category" required />

	<label for="prize">Prize</label>
	<textarea id="prize" name="prize" required />

	<button type="submit">Save</button>
</form>

<h2>Delete All Prizes</h2>

<form method="POST" action="?/deleteAll" use:enhance>
	<button
		use:confirmationDialog={{
			text: 'Are you sure you want to delete all prizes?',
			cancel: 'Cancel',
			ok: 'Delete',
		}}>Delete</button
	>
</form>

<style>
	input,
	textarea {
		margin-bottom: 1rem;
	}
</style>
