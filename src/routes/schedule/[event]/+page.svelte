<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role, type Event } from '@prisma/client';
	import type { ActionData } from './$types';

	export let data;
	export let form: ActionData;

	let editedEvent: Event | null = null;
	$: if (form !== null) {
		editedEvent = form;
		if (browser) {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		}
	}
</script>

<h1>{data.event.name}</h1>
<h2>
	{data.event.location} | {data.event.start.toLocaleString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	})} - {data.event.end.toLocaleString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	})}
</h2>
<h3>{data.event.description}</h3>

{#if data.user?.role === Role.ADMIN}
	<hr />
	<h1>Edit Event</h1>
	<form method="POST" action={'?/saveEdit'} use:enhance>
		<input type="hidden" name="id" value={data.event.id} />

		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={data.event.name} />

		<label for="description">Description</label>
		<textarea id="description" name="description" required value={data.event.description} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={data.event.start.toLocaleString('sv')}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={data.event.end.toLocaleString('sv')}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={data.event.location} />

		<Dropdown
			value={data.event.type}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button type="submit">Save</button>
	</form>
{/if}
