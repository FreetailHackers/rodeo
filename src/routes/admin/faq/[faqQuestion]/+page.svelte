<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - FAQ - {data.question.title}</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit FAQ</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.question.id} />
			<button
				use:confirmationDialog={{
					text: 'Are you sure you want to delete this FAQ?',
					cancel: 'Cancel',
					ok: 'Delete',
				}}>Delete FAQ</button
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
		<input type="hidden" name="id" value={data.question.id} />

		<label for="title">Question</label>
		<input type="text" id="title" name="title" required value={data.question.title} />

		<label for="response">Answer</label>
		<MarkdownEditor id="response" name="response" required value={data.question.response} />

		<button class="submit" type="submit">Save</button>
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
		margin-bottom: 1rem;
	}

	.submit {
		margin-top: 15px;
	}
</style>
