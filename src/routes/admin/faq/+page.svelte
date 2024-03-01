<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
</script>

<svelte:head>
	<title>Rodeo | Admin - Schedule</title>
</svelte:head>

<h2>Create New Question</h2>
<form method="POST" action="?/create" use:enhance>
	<input type="hidden" name="id" />

	<label for="question">Question</label>
	<input type="text" id="question" name="question" required />

	<label for="answer">Answer</label>
	<textarea id="answer" name="answer" required />

	<button type="submit">Save</button>
</form>

<h2>Delete All Questions</h2>

<form method="POST" action="?/deleteAll" use:enhance>
	<button
		use:confirmationDialog={{
			text: 'Are you sure you want to delete all events?',
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
