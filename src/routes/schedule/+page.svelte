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

	let currentDateTime = new Date();
	const updateDateTime = () => {
		currentDateTime = new Date();
	};

	setInterval(updateDateTime, 1000);

	let displayDate = currentDateTime;
	let firstHackathonDate = data.dates[0];
	if (displayDate.getTime() < firstHackathonDate.getTime()) {
		displayDate = firstHackathonDate;
	}
</script>

<h1>Schedule</h1>
<div class="schedule">
	<div class="legend">
		<mark class="Regular-Event">Regular Event</mark>
		<mark class="Key-Event">Key Event</mark>
		<mark class="Speaker-Event">Speaker Event</mark>
		<mark class="Fun-Event">Fun Event</mark>
		<mark class="Workshop">Workshop</mark>
	</div>

	<div class="btn-group">
		{#each data.dates as eventDate}
			<button
				id={eventDate.toDateString()}
				on:click={() => (displayDate = eventDate)}
				class={displayDate.toDateString() === eventDate.toDateString() ? 'btn selected' : 'btn'}
				>{eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
			</button>
		{/each}
	</div>

	<ul>
		{#each data.schedule as event}
			{#if event.start.toDateString() === displayDate.toDateString()}
				<li class={event.type} style={currentDateTime > event.end ? 'opacity:0.65;' : ''}>
					<!-- Element removal box -->
					{#if data.user?.role === Role.ADMIN}
						<div>
							<form method="POST" use:enhance>
								<input type="hidden" name="id" value={event.id} />
								<button type="submit" formaction="?/delete">❌</button>
								<button type="submit" formaction="?/edit">✏</button>
							</form>
						</div>
					{/if}
					<!-- Event box -->
					<h2 class="event-name">
						{event.name} <a class="hyperlink" href="/schedule/{event.id}">ℹ️</a>
					</h2>
					<h4 class="event-info">📍{' ' + event.location}</h4>
					<h4 class="event-info">
						{event.start.toLocaleString('en-US', {
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
						})} - {event.end.toLocaleString('en-US', {
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
						})}
					</h4>
				</li>
			{/if}
		{/each}
	</ul>
</div>

{#if data.user?.role === Role.ADMIN}
	<hr />
	<h2>{editedEvent == null ? 'Create New Event' : 'Edit Event'}</h2>
	<form
		method="POST"
		action={editedEvent == null ? '?/create' : '?/saveEdit'}
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="id" value={editedEvent?.id} />

		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={editedEvent?.name ?? ''} />

		<label for="description">Description</label>
		<textarea id="description" name="description" required value={editedEvent?.description ?? ''} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={editedEvent?.start.toLocaleString('sv') ?? ''}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={editedEvent?.end.toLocaleString('sv') ?? ''}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={editedEvent?.location ?? ''} />

		<Dropdown
			value={editedEvent?.type ?? ''}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button type="submit">Save</button>
	</form>
{/if}

<style>
	@media only screen and (min-width: 600px) {
		.legend {
			display: absolute;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
		}
	}

	.schedule {
		padding: 20px;
		background-color: #f5f2ee;
	}

	mark {
		padding-left: 5px;
		padding-right: 5px;
		text-align: center;
	}

	ul {
		padding: 0;
		list-style-type: none;
	}

	li {
		text-align: center;
		margin: 15px 0;
		padding-top: 2px;
		padding-bottom: 15px;
	}

	.legend {
		display: inline-block;
		margin: 0 auto;
		text-align: center;
		justify-content: center;
	}

	.event-name {
		margin-top: 15px;
		margin-bottom: 10px;
	}

	.event-info {
		text-align: center;
		margin: 10px;
	}
	ul {
		padding: 0;
		list-style-type: none;
	}

	.Key-Event {
		background-color: #c1e7e3;
	}

	.Workshop {
		background-color: #b6fcf4;
	}

	.Speaker-Event {
		background-color: #ff9bdf;
	}

	.Fun-Event {
		background-color: #dabfde;
	}

	.Regular-Event {
		background-color: #bbbddd;
	}

	/* Admin view */

	li form {
		flex-direction: row-reverse;
	}

	li button {
		background-color: #0000008f;
		width: 50px;
		color: #ffffff;
		border: none;
		margin: 12px 15px 0 0;
	}

	li button:hover {
		background-color: #972626;
	}

	div.btn-group {
		padding-top: 20px;
		display: flex;
		justify-content: center;
	}

	button.btn {
		flex: 1;
	}

	button.btn:not(:last-child) {
		margin-right: 5px;
	}
	button.btn:hover {
		background-color: #9e3f00;
	}

	li div {
		position: absolute;
		padding-left: 15px;
	}

	a.hyperlink {
		text-decoration: none;
	}

	hr {
		margin-top: 20px;
	}

	li.true {
		opacity: 0.5px;
	}

	button.selected {
		text-decoration: underline;
	}
</style>
