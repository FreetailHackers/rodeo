<script lang="ts">
	import { enhance } from '$app/forms';
	import { Modal, Content, Trigger } from 'sv-popup';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import tz from 'dayjs/plugin/timezone';

	dayjs.extend(utc);
	dayjs.extend(tz);

	type ScheduleEvent = {
		id: number;
		name: string;
		description: string;
		start: Date | null;
		end: Date | null;
		location: string;
		type: string;
	};

	interface Props {
		scheduleEvent?: ScheduleEvent | null;
		timezone: string;
	}

	let { scheduleEvent = null, timezone }: Props = $props();

	function formatForInput(date: Date | null | undefined): string {
		if (!date) return '';
		return dayjs(date).tz(timezone).format('YYYY-MM-DDTHH:mm');
	}

	let closeModal = $state(false);
</script>

<Modal basic bind:close={closeModal}>
	<Content>
		<h2>{scheduleEvent ? 'Edit Event' : 'Create Event'}</h2>

		<form
			method="POST"
			action="?/handleEvent"
			use:enhance={() => {
				return async ({ update }) => {
					await update();
					closeModal = true;
				};
			}}
		>
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
				{...scheduleEvent?.start ? { value: formatForInput(scheduleEvent.start) } : {}}
			/>

			<label for="end">End Time</label>
			<input
				type="datetime-local"
				id="end"
				name="end"
				{...scheduleEvent?.end ? { value: formatForInput(scheduleEvent.end) } : {}}
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
				<option value="required">Required</option>
				<option value="meal">Meal</option>
				<option value="socials">Socials</option>
				<option value="workshop">Workshop</option>
			</select>

			<button type="submit">{scheduleEvent ? 'Save Changes' : 'Create Event'}</button>
		</form>
	</Content>
	<Trigger>
		{#if scheduleEvent}
			<p>Edit Event</p>
		{:else}
			<button>+ New</button>
		{/if}
	</Trigger>
</Modal>
