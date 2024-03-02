<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';

	export let data;
</script>

<svelte:head>
	<title>Rodeo | Admin - Prize - {data.prize.title}</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit Prize</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.prize.id} />
			<button
				use:confirmationDialog={{
					text: 'Are you sure you want to delete this prize?',
					cancel: 'Cancel',
					ok: 'Delete',
				}}>Delete Prize</button
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
		<input type="hidden" name="id" value={data.prize.id} />

		<label for="title">Title</label>
		<input type="text" id="title" name="title" required value={data.prize.title} />

		<label for="response">Response</label>
		<textarea id="response" name="response" required value={data.prize.response} />

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
