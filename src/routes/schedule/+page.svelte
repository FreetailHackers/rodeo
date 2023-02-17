<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import Users from '$lib/components/users.svelte';
	import type { PageData } from './$types';
	import Radio from '$lib/components/radio.svelte';
	import Dropdown from '$lib/components/dropdown.svelte';
	import Multiselect from '$lib/components/multiselect.svelte';

	export let data: PageData;
	let releaseConfirm = false;
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
	<input type="text" id="schedule" name="schedule" />

	<label for="description">Description</label>
	<textarea id="description" name="description" />

	<Dropdown
		value={null}
		name="type"
		label="type"
		options={['Key Event', 'Workshop', 'Speaker Event', 'Fun Event', 'Regular Event']}
		required
	/>

	<label for="startTime">Start Time</label>
	<input type="datetime-local" id="startTime" name="startTime" />

	<button type="submit">Submit</button>
</form>
