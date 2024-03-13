<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Challenge - {data.challenge.title}</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit Challenge</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.challenge.id} />
			<button
				use:confirmationDialog={{
					text: 'Are you sure you want to delete this challenge?',
					cancel: 'Cancel',
					ok: 'Delete',
				}}>Delete Challenge</button
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
		<input type="hidden" name="id" value={data.challenge.id} />

		<label for="title">Title</label>
		<input type="text" id="title" name="title" required value={data.challenge.title} />

		<label for="response">Response</label>
		<textarea id="response" name="response" required value={data.challenge.response} />

		<button type="submit" style="margin-top: 1rem;">Save</button>
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
		margin-bottom: 2rem;
	}
</style>
