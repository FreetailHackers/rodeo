<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Schedule - {data.event.name}</title>
</svelte:head>

<div class="container">
	<div id="header">
		<h1>Edit Event</h1>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.event.id} />
			<button
				use:confirmationDialog={{
					text: 'Are you sure you want to delete this event?',
					cancel: 'Cancel',
					ok: 'Delete',
				}}>Delete Event</button
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
		<input type="hidden" name="id" value={data.event.id} />

		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={data.event.name} />

		<label for="description">Description</label>
		<div id="description">
			<textarea id="description" name="description" value={data.event.description} required />
		</div>

		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={data.event.start.toLocaleString('sv', { timeZone: data.timezone })}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={data.event.end.toLocaleString('sv', { timeZone: data.timezone })}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={data.event.location} />

		<label for="type">Event Type</label>
		<select name="type" value={data.event.type} required>
			<option value="Regular-Event">Regular Event</option>
			<option value="Key-Event">Key Event</option>
			<option value="Speaker-Event">Speaker Event</option>
			<option value="Fun-Event">Fun Event</option>
			<option value="Workshop">Workshop</option>
		</select>

		<button type="submit">Save</button>
	</form>
</div>

<style>
	#header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	textarea {
		width: 100%;
	}

	select,
	input,
	form,
	#description {
		margin-bottom: 1rem;
	}
</style>
