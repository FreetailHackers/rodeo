<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Sponsor</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit Sponsor</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.sponsor.id} />
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
		<input type="hidden" name="id" value={data.sponsor.id} />

		<label for="sponsorLogo">Sponsor Logo</label>
		<input type="file" id="sponsorLogo" name="sponsorLogo" accept=".jpg, .jpeg, .png, .webp" />

		<label for="sponsorLink">Sponsor Link</label>
		<input type="url" id="sponsorLink" name="sponsorLink" value={data.sponsor.title} />

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
		margin-bottom: 0.5rem;
	}
</style>
