<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
</script>

<svelte:head>
	<title>Formula Hacks | Admin - FAQ</title>
</svelte:head>

<h2>Create New FAQ</h2>
<form method="POST" action="?/create" use:enhance>
	<input type="hidden" name="id" />

	<label for="question">Question</label>
	<input type="text" id="question" name="question" required />

	<label for="answer">Answer</label>
	<MarkdownEditor id="answer" name="answer" required />

	<button class="submit" type="submit">Save</button>
</form>

<h2>Delete All FAQs</h2>

<form method="POST" action="?/deleteAll" use:enhance>
	<button
		use:confirmationDialog={{
			text: 'Are you sure you want to delete all FAQ?',
			cancel: 'Cancel',
			ok: 'Delete',
		}}>Delete</button
	>
</form>

<style>
	input,
	button {
		margin-bottom: 1rem;
	}
</style>
