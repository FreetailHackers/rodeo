<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role, type Event } from '@prisma/client';
	import type { ActionData } from './$types';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
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

	// Loops through all events and finds the closest date to the current date
	let displayDate = currentDateTime;
	if (data.dates.length > 0) {
		displayDate = data.dates.reduce((prev, curr) =>
			Math.abs(curr.getTime() - currentDateTime.getTime()) <
			Math.abs(prev.getTime() - currentDateTime.getTime())
				? curr
				: prev
		);
	}

	// Calendar functionality
	type DateArray = [year: number, month: number, day: number, hour: number, minute: number];

	function dateToIcsArray(date: Date): DateArray {
		return [
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate(),
			date.getHours(),
			date.getMinutes(),
		];
	}

	interface calEvent {
		title: string;
		description: string;
		location: string;
		start: Date;
		end: Date;
	}

	let icsData: calEvent[] = [];

	// // function generateIcsContent() {
	// // 	let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Rodeo//NONSGML//EN\n';
	// // 	for (const event of icsData) {
	// // 		icsContent += 'BEGIN:VEVENT\n';
	// // 		icsContent += `SUMMARY:${event.title}\n`;
	// // 		icsContent += `DTSTART:${new Date(
	// // 			event.start[0],
	// // 			event.start[1] - 1,
	// // 			event.start[2],
	// // 			event.start[3],
	// // 			event.start[4]
	// // 		)
	// // 			.toISOString()
	// // 			.replace(/[-:]/g, '')
	// // 			.replace(/\.\d\d\d/g, '')}\n`;
	// // 		icsContent += `DTEND:${new Date(
	// // 			event.end[0],
	// // 			event.end[1] - 1,
	// // 			event.end[2],
	// // 			event.end[3],
	// // 			event.end[4]
	// // 		)
	// // 			.toISOString()
	// // 			.replace(/[-:]/g, '')
	// // 			.replace(/\.\d\d\d/g, '')}\n`;
	// // 		icsContent += `DESCRIPTION:${event.description}\n`;
	// // 		icsContent += `LOCATION:${event.location}\n`;
	// // 		icsContent += 'END:VEVENT\n';
	// // 	}
	// // 	icsContent += 'END:VCALENDAR\n';
	// // 	const blob = new Blob([icsContent], { type: 'text/calendar' });
	// // 	url = URL.createObjectURL(blob);
	// // }

	let url: string;

	onMount(() => {
		for (const event of data.schedule) {
			const icsEvent = {
				title: event.name,
				start: event.start,
				end: event.end,
				description: event.description,
				location: event.location,
			};
			icsData.push(icsEvent);
		}
		url = generateIcsContent(icsData);
	});
</script>

<h1>Schedule</h1>
{#if url && data.schedule.length > 0}
	<a class="calendar-export-link" href={url} download="events.ics">Download All Events</a>
{/if}
<div class="schedule">
	<div>
		<div class="key">
			<div class="box Regular-Event" />
			&nbsp;Regular Event
		</div>
		<div class="key">
			<div class="box Key-Event" />
			&nbsp;Key Event
		</div>
		<div class="key">
			<div class="box Speaker-Event" />
			&nbsp;Speaker Event
		</div>
		<div class="key">
			<div class="box Fun-Event" />
			&nbsp;Fun Event
		</div>
		<div class="key">
			<div class="box Workshop" />
			&nbsp;Workshop
		</div>
	</div>
	<br />
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
				<li class={currentDateTime > event.end ? event.type + ' passed' : event.type}>
					<!-- Element removal box -->
					{#if data.user?.role === Role.ADMIN}
						<div class="modification-buttons">
							<form method="POST" use:enhance>
								<input type="hidden" name="id" value={event.id} />
								<button type="submit" formaction="?/delete">❌</button>
								<button type="submit" formaction="?/edit">✏</button>
							</form>
						</div>
					{/if}
					<!-- Event box -->
					<a class="hyperlink" href="/schedule/{event.id}">ℹ️</a>
					<h2 class="event-name">
						{event.name}
					</h2>
					<h4 class="event-info">📍&nbsp;{event.location}</h4>
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
	<form method="POST" action={editedEvent == null ? '?/create' : '?/saveEdit'} use:enhance>
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
	.schedule {
		width: 100%;
		padding: 20px 20px 5px 20px;
		background-color: #f5f2ee;
	}

	div {
		display: inline-block;
		text-align: center;
	}

	ul {
		padding: 0;
		list-style-type: none;
	}

	li {
		position: relative;
		text-align: center;
		padding: 2px 2px;
	}

	li:not(:last-child) {
		margin: 22px 0;
	}

	.box {
		float: left;
		height: 20px;
		width: 20px;
		margin-bottom: 15px;
		border: 1px solid black;
		clear: both;
	}

	div.key:not(:last-child) {
		margin-right: 10px;
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

	div.btn-group {
		display: flex;
		justify-content: center;
		gap: 0.3rem;
	}

	button.btn {
		flex: 1;
	}

	button.selected {
		text-decoration: underline;
	}

	li div {
		position: absolute;
	}

	a.hyperlink {
		margin-top: 15px;
		margin-right: 15px;
		right: 0;
		position: absolute;
		font-size: 30px;
		text-decoration: none;
	}

	li.passed {
		opacity: 0.5;
	}

	/* Admin view */

	hr {
		margin-top: 20px;
	}

	div.modification-buttons {
		position: absolute;
		left: 0;
		margin-left: 15px;
	}

	li form {
		flex-direction: row;
	}

	li button {
		background-color: #0000008f;
		width: 30px;
		height: 30px;
		color: #ffffff;
		border: none;
		margin: 15px 15px 0px 0px;
	}

	li button:hover {
		background-color: #972626;
	}

	a.calendar-export-link {
		padding-bottom: 10px;
		display: flex;
		justify-content: right;
	}
</style>
