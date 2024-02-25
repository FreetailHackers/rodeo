<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(customParseFormat);
	dayjs.extend(utc);
	dayjs.extend(timezone);

	export let data;

	// Group by day of the week
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	const groupByDateArray: { day: string; events: any[] }[] = [];

	for (let event of data.schedule) {
		const dayOfWeek = daysOfWeek[new Date(event.start).getDay()];
		let dayEntry = groupByDateArray.find((entry) => entry.day === dayOfWeek);

		if (!dayEntry) {
			dayEntry = { day: dayOfWeek, events: [] };
			groupByDateArray.push(dayEntry);
		}

		dayEntry.events.push(event);
	}

	let hoveredId: number | null = null;

	let currentDateTime = new Date();

	// Filtering
	let selected: string | null = null;
	let filters = [...new Set(data.schedule.map((event) => event.type))];

	function chosenFilter(filter: string | null) {
		selected = selected === filter ? null : filter;
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

<h2 class="subtitle">Filters</h2>

{#each filters as filter}
	<button
		class:active={selected === filter}
		data-name={filter}
		on:click={() => chosenFilter(filter)}
	>
		{filter}
	</button>
{/each}

{#if url && data.schedule.length > 0}
	<button
		><a class="calendar-export-link" href={url} download="events.ics">Download All Events</a
		></button
	>{/if}

<div class="container">
	{#each groupByDateArray as { day, events }}
		<div class="column">
			<h2 class="subtitle">{day}</h2>
			{#each events as event}
				{#if selected === null || event.type === selected}
					<div
						class="card card-text {currentDateTime >= event.start && currentDateTime < event.end
							? 'currentEvent'
							: ''}"
						on:mouseenter={() => {
							hoveredId = event.id;
						}}
						on:mouseleave={() => {
							hoveredId = null;
						}}
					>
						<div class="flex-row">
							<p class="name">{event.name}</p>
							{#if hoveredId !== event.id}
								<p class="date">
									{event.start.toLocaleString('en-US', {
										timeZone: data.timezone,
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</p>
							{:else}
								<p class="date">
									{event.start.toLocaleString('en-US', {
										timeZone: data.timezone,
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})} - {event.end.toLocaleString('en-US', {
										timeZone: data.timezone,
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</p>
							{/if}
						</div>
						<div class="flex-row">
							<p class="location">{event.location}</p>
							{#if data.user?.roles.includes('ADMIN')}
								<p>
									<a class="edit" href="/schedule/{event.id}">Edit</a>
								</p>
							{/if}
						</div>

						{#if hoveredId === event.id}
							<p class="description">{event.description}</p>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	{/each}
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
	h1 {
		font-family: 'Zen Dots', sans-serif;
		font-weight: 400;
		font-style: normal;
		text-align: center;
		font-size: 64px;
		color: #f2ebd9;
	}

	.subtitle {
		font-family: 'Fugaz One';
		color: #f2ebd9;
		text-align: left;
		font-size: 36px;
	}

	p {
		all: unset;
		font-family: 'Geologica', sans-serif;
	}

	p.name,
	p.date {
		font-size: 18px;
	}

	p.description {
		padding-top: 3px;
		text-align: left;
	}

	p.location,
	p.description {
		font-size: 14px;
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

	/* Admin view */

	hr {
		margin-top: 20px;
	}

	a.calendar-export-link {
		text-decoration: none;
		color: #303030;
	}

	/* .name,
	.location,
	.date {
		flex: 1;
	} */

	/* .date {
		text-align: right;
	} */

	button {
		background-color: #f2ebd9;
		color: #303030;
		font-family: 'Geologica', sans-serif;
	}

	.active {
		background-color: #303030;
		color: #f2ebd9;
	}

	.flex-row {
		display: flex;
		justify-content: space-between;
	}

	.card {
		box-shadow: 0 4px 8px rgb(0, 0, 0);
		background-color: #303030;
		border-radius: 10px;
		display: flex;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		margin-bottom: 0.75rem;
	}

	.currentEvent {
		border: solid #e1563f 4px;
		padding-bottom: calc(1rem - 4px);
	}

	.card:hover {
		background-color: #f2ebd9;
	}

	.card-text {
		font-family: 'Geologica', sans-serif;
		font-optical-sizing: auto;
		font-style: normal;
		color: #f2ebd9;
	}

	.card-text:hover {
		color: #303030;
	}

	.container {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.column {
		flex: 0 1 49%; /* Adjust the width as needed */
		margin-bottom: 20px;
	}

	.edit {
		color: #e1563f;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
		}

		.column {
			flex: 1 0 100%;
		}
	}
</style>
