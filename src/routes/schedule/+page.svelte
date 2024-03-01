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
	let groupByDateArray: { day: string; events: any[]; hasMatchingEvents: boolean }[] = [];

	for (let event of data.schedule) {
		const dayOfWeek = daysOfWeek[new Date(event.start).getDay()];
		let dayEntry = groupByDateArray.find((entry) => entry.day === dayOfWeek);

		if (!dayEntry) {
			dayEntry = { day: dayOfWeek, events: [], hasMatchingEvents: true };
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

		groupByDateArray.forEach((group) => {
			if (selected === null) {
				group.hasMatchingEvents = true;
			} else {
				group.hasMatchingEvents = group.events.some((event) => event.type === selected);
			}
		});
		groupByDateArray = groupByDateArray;
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
<div class="bg-img">
	<h1>Schedule</h1>

	<div class="container">
		<div class="sidebar">
			<h2>Filters</h2>
			<div class="button-container">
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
						><a class="calendar-export" href={url} download="events.ics">Download Schedule</a
						></button
					>{/if}
			</div>
		</div>
		{#each groupByDateArray as { day, events, hasMatchingEvents }}
			<div class="column">
				<h2>{day}</h2>
				{#if hasMatchingEvents}
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
									<div class="name-location">
										<p class="name">{event.name}</p>
										<p class="location">{event.location}</p>
										{#if data.user?.roles.includes('ADMIN')}
											<p>
												<a class="edit" href="/schedule/{event.id}">Edit</a>
											</p>
										{/if}
									</div>
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
											from {event.start.toLocaleString('en-US', {
												timeZone: data.timezone,
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											})} <br /> to {event.end.toLocaleString('en-US', {
												timeZone: data.timezone,
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											})}
										</p>
									{/if}
								</div>
								{#if hoveredId === event.id}
									<p class="description">{event.description}</p>
								{/if}
							</div>
						{/if}
					{/each}
				{:else}
					<p class="empty-events">There are no events that fall under this category.</p>
				{/if}
			</div>
		{/each}
	</div>

	{#if data.user?.roles.includes('ADMIN')}
		<div class="admin-panel">
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

				<button class="admin-button" type="submit">Save</button>
			</form>
		</div>
	{/if}
</div>

<style>
	.bg-img {
		background-image: url('Topographic Background (Tilable).svg');

		/* Khang */
		/* background-repeat: repeat;
		background-size: 100%; */
		/* kick footer to bottom of page */
		min-height: 100vh;
		/* pad header to correct spot */
		padding: 3rem 0.5rem 0 0.5rem;
		/* Don't let user select the text. Might want to move to mobile only */
		user-select: none;
	}

	.sidebar {
		width: 16rem;
		margin: 0 10px;
	}

	h1 {
		color: #f2ebd9;
		font-size: 64px;
		font-weight: 400;
		margin: 0;
		text-align: center;
		text-shadow: 0 4px 12px black;
	}

	h2 {
		color: #f2ebd9;
		font-family: 'Fugaz One';
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	button {
		background-color: #f2ebd9;
		color: #303030;
		height: 2rem;
		font-family: 'Geologica', sans-serif;
		border-radius: 4px;
		margin: 2px 2px;
		flex-grow: 1;
		justify-content: center;
	}

	.button-container {
		display: flex;
		flex-wrap: wrap;
	}

	.active {
		background-color: #303030;
		color: #f2ebd9;
	}

	p {
		margin: 0;
	}

	.date,
	.name,
	.date {
		font-size: 18px;
	}

	.location,
	.description {
		font-size: 14px;
	}

	.date {
		text-align: right;
		flex-shrink: 0;
	}

	.description {
		padding-top: 3px;
	}

	.calendar-export {
		text-decoration: none;
		color: #303030;
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
		flex-direction: column;
		padding: 0.75rem;
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
		color: #f2ebd9;
	}

	.card-text:hover {
		color: #303030;
	}

	.container {
		display: flex;
		flex-wrap: wrap;
		max-width: 75rem;
		margin: auto;
	}

	.column {
		flex: 1;
		margin: 0px 5px;
	}

	.empty-events {
		color: #f2ebd9;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 9.5vw;
		}

		.sidebar {
			width: unset;
		}

		.container {
			flex-direction: column;
			margin: 0 10px 0 10px;
		}

		.column {
			flex: 1 0 100%;
		}
	}

	/* Admin view */
	hr {
		margin-top: 3rem;
	}

	.admin-panel {
		max-width: 50rem;
		margin-left: auto;
		margin-right: auto;
		padding: 0 10px 0 10px;
		padding-bottom: 3rem;
	}

	.admin-button {
		background-color: #e1563f;
		color: #f2ebd9;
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #f2ebd9;
		font-family: 'Geologica', sans-serif;
	}

	input,
	textarea,
	select {
		background-color: #f2ebd9;
		color: #303030;
	}

	select,
	input,
	textarea {
		margin-bottom: 1rem;
	}
</style>
