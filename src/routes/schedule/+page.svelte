<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	export let data;

	const dateToString = (date: Date) =>
		date.toLocaleDateString('en-US', {
			timeZone: data.timezone,
			weekday: 'long',
			month: 'long',
			day: 'numeric',
		});

	let currentDateTime = new Date();
	const updateDateTime = () => {
		currentDateTime = new Date();
	};
	setInterval(updateDateTime, 1000);

	// Loops through all events and finds the closest date to the current date
	const dates = [
		...new Set(
			data.schedule.flatMap((event) => [dateToString(event.start), dateToString(event.end)])
		),
	];
	let displayDate = dateToString(currentDateTime);
	if (dates.length > 0) {
		displayDate = dates.reduce((prev, curr) =>
			Math.abs(Date.parse(prev) - currentDateTime.getTime()) <
			Math.abs(Date.parse(curr) - currentDateTime.getTime())
				? curr
				: prev
		);
	}

	// Calendar functionality
	let url: string;

	onMount(() => {
		url = generateIcsContent(data.schedule);
	});
</script>

<svelte:head>
	<title>Rodeo | Schedule</title>
</svelte:head>

<h1>Schedule</h1>
{#if url && data.schedule.length > 0}
	<a class="calendar-export-link" href={url} download="events.ics">Download All Events</a>
{/if}
<div class="schedule">
	<div>
		<p><strong><em>All times are in {data.timezone}</em></strong></p>
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
		{#each dates as date}
			<button
				on:click={() => (displayDate = date)}
				class={displayDate === date ? 'btn selected' : 'btn'}
				>{date}
			</button>
		{/each}
	</div>
	<ul>
		{#each data.schedule as event}
			<!-- Must call dateToString and convert back to date to keep timezone consistent -->
			{#if new Date(displayDate) >= new Date(dateToString(event.start)) && new Date(displayDate) <= new Date(dateToString(event.end))}
				<li class={currentDateTime > event.end ? event.type + ' passed' : event.type}>
					<!-- Event box -->
					<a class="hyperlink" href="/schedule/{event.id}">ℹ️</a>
					<h2 class="event-name">
						{event.name}
					</h2>
					<h4 class="event-info">📍&nbsp;{event.location}</h4>
					<h4 class="event-info">
						{event.start.toLocaleString('en-US', {
							timeZone: data.timezone,
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
							weekday: dateToString(event.start) === displayDate ? undefined : 'long',
							month: dateToString(event.start) === displayDate ? undefined : 'long',
							day: dateToString(event.start) === displayDate ? undefined : 'numeric',
						})} - {event.end.toLocaleString('en-US', {
							timeZone: data.timezone,
							hour: 'numeric',
							minute: 'numeric',
							hour12: true,
							weekday: dateToString(event.end) === displayDate ? undefined : 'long',
							month: dateToString(event.end) === displayDate ? undefined : 'long',
							day: dateToString(event.end) === displayDate ? undefined : 'numeric',
						})}
					</h4>
				</li>
			{/if}
		{/each}
	</ul>
</div>

{#if data.user?.roles.includes('ADMIN')}
	<hr />
	<h2>Create New Event</h2>
	<form method="POST" use:enhance>
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
{/if}

<style>
	.schedule {
		width: 100%;
		padding: 5px 20px;
		background-color: #f5f2ee;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	select,
	input,
	textarea {
		margin-bottom: 1rem;
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

	a.calendar-export-link {
		padding-bottom: 10px;
		display: flex;
		justify-content: right;
	}
</style>
