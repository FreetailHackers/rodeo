<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Dropdown from '$lib/components/dropdown.svelte';

	export let data: PageData;
</script>

<ul>
	{#each data.schedule as event}
		<li>{event.name}</li>
		<li>{event.description}</li>
		<li>{event.start}</li>
	{/each}
</ul>

<form method="POST" action="?/schedule" use:enhance>
	<label for="schedule">Schedule Name</label>
	<input type="text" id="schedule" name="schedule" required />

	<label for="description">Description</label>
	<textarea id="description" name="description" />

	<label for="startTime">Start Time</label>
	<input type="datetime-local" id="startTime" name="startTime" />

	<label for="endTime">End Time</label>
	<input type="datetime-local" id="endTime" name="endTime" />

	<label for="location">Location</label>
	<input type="text" id="location" name="location" />

	<Dropdown
		value={null}
		name="type"
		label="Event Type"
		options={['Key Event', 'Workshop', 'Speaker Event', 'Fun Event', 'Regular Event']}
		required
	/>

	<button type="submit">Submit</button>
</form>
