<script lang="ts">
	import { enhance } from '$app/forms';
	// @ts-expect-error: The 'sv-popup' module does not have type definitions, so we are temporarily using 'any' type.
	import { Modal, Content, Trigger } from 'sv-popup';

	type Event = {
		id: number;
		name: string;
		description: string;
		start: Date | null;
		end: Date | null;
		location: string;
		type: string;
	};

	export let event: Event | null = null;
</script>

<Modal basic button={false}>
	<Content>
		<h2>{event ? 'Edit Event' : 'Create Event'}</h2>

		<form method="POST" action={event ? '?/editEvent' : '?/createEvent'} use:enhance>
			<label for="name">Name</label>
			<input type="text" id="name" name="name" required {...event ? { value: event.name } : {}} />

			<label for="description">Description</label>
			<textarea id="description" name="description" required>{event?.description || ''}</textarea>

			<label for="start">Start Time</label>
			<input
				type="datetime-local"
				id="start"
				name="start"
				{...event?.start ? { value: event.start.toISOString().slice(0, 16) } : {}}
			/>

			<label for="end">End Time</label>
			<input
				type="datetime-local"
				id="end"
				name="end"
				{...event?.end ? { value: event.end.toISOString().slice(0, 16) } : {}}
			/>

			<label for="location">Location</label>
			<input
				type="text"
				id="location"
				name="location"
				required
				{...event ? { value: event.location } : {}}
			/>

			<label for="type">Event Type</label>
			<select name="type" value={event?.type || ''} required>
				<option value="Regular-Event">Regular Event</option>
				<option value="Key-Event">Key Event</option>
				<option value="Speaker-Event">Speaker Event</option>
				<option value="Fun-Event">Fun Event</option>
				<option value="Workshop">Workshop</option>
			</select>

			<button type="submit">{event ? 'Save Changes' : 'Create Event'}</button>
		</form>
	</Content>
	<Trigger>
		{#if event}
			<p>Edit Event</p>
		{:else}
			<img src="/add-button.png" alt="Add" draggable="false" />
		{/if}
	</Trigger>
</Modal>
