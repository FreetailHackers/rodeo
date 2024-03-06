<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
</script>

<svelte:head>
	<title>Rodeo | Admin - Challenge</title>
</svelte:head>

<h2>Create New Challenge</h2>
<form method="POST" action="?/create" use:enhance>
	<input type="hidden" name="id" />

	<label for="category">Category</label>
	<input type="text" id="category" name="category" required />

	<label for="challenge">Challenge</label>
	<textarea id="challenge" name="challenge" required />

	<button type="submit">Save</button>
</form>

<h2>Delete All Challenges</h2>

<form method="POST" action="?/deleteAll" use:enhance>
	<button
		use:confirmationDialog={{
			text: 'Are you sure you want to delete all challenges?',
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
