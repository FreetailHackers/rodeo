<script lang="ts">
	import { enhance } from '$app/forms';
	// @ts-expect-error: The 'sv-popup' module does not have type definitions, so we are temporarily using 'any' type.
	import { Modal, Content, Trigger } from 'sv-popup';

	type ScheduleEvent = {
		id: number;
		name: string;
		description: string;
		start: Date | null;
		end: Date | null;
		location: string;
		type: string;
	};

	export let scheduleEvent: ScheduleEvent | null = null;

	let closeModal = false;

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);

		await fetch(form.action, {
			method: form.method,
			body: formData,
		});

		closeModal = true;
	}
</script>

<Modal basic bind:close={closeModal}>
	<Content>
		<h2>{scheduleEvent ? 'Edit Event' : 'Create Event'}</h2>

		<form method="POST" action="?/handleEvent" on:submit|preventDefault={handleSubmit} use:enhance>
			<input type="hidden" name="id" value={scheduleEvent?.id || ''} />
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				name="name"
				required
				{...scheduleEvent ? { value: scheduleEvent.name } : {}}
			/>

			<label for="description">Description</label>
			<textarea id="description" name="description" required
				>{scheduleEvent?.description || ''}</textarea
			>

			<label for="start">Start Time</label>
			<input
				type="datetime-local"
				id="start"
				name="start"
				{...scheduleEvent?.start ? { value: scheduleEvent.start.toISOString().slice(0, 16) } : {}}
			/>

			<label for="end">End Time</label>
			<input
				type="datetime-local"
				id="end"
				name="end"
				{...scheduleEvent?.end ? { value: scheduleEvent.end.toISOString().slice(0, 16) } : {}}
			/>

			<label for="location">Location</label>
			<input
				type="text"
				id="location"
				name="location"
				required
				{...scheduleEvent ? { value: scheduleEvent.location } : {}}
			/>

			<label for="type">Event Type</label>
			<select name="type" value={scheduleEvent?.type || ''} required>
				<option value="Regular-Event">Regular Event</option>
				<option value="Key-Event">Key Event</option>
				<option value="Speaker-Event">Speaker Event</option>
				<option value="Fun-Event">Fun Event</option>
				<option value="Workshop">Workshop</option>
			</select>

			<button type="submit">{scheduleEvent ? 'Save Changes' : 'Create Event'}</button>
		</form>
	</Content>
	<Trigger>
		{#if scheduleEvent}
			<p>Edit Event</p>
		{:else}
			<img src="/add-button.png" alt="Add" draggable="false" />
		{/if}
	</Trigger>
</Modal>
