<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
</script>

<svelte:head>
	<title>Rodeo | Admin - Schedule</title>
</svelte:head>

<h2>Create New Event</h2>
<form method="POST" action="?/create" use:enhance>
	<input type="hidden" name="id" />

	<label for="name">Name</label>
	<input type="text" id="name" name="name" required />

	<label for="description">Description</label>
	<textarea id="description" name="description" required />

	<label for="start">Start Time</label>
	<input type="datetime-local" id="start" name="start" required />

	<label for="end">End Time</label>
	<input type="datetime-local" id="end" name="end" required />

	<label for="location">Location</label>
	<input type="text" id="location" name="location" required />

	<label for="type">Event Type</label>
	<select name="type" required>
		<option value="Regular-Event">Regular Event</option>
		<option value="Key-Event">Key Event</option>
		<option value="Speaker-Event">Speaker Event</option>
		<option value="Fun-Event">Fun Event</option>
		<option value="Workshop">Workshop</option>
	</select>

	<button type="submit">Save</button>
</form>

<h2>Delete All Events</h2>
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
	select,
	input,
	textarea {
		margin-bottom: 1rem;
	}
</style>
