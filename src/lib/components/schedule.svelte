<script lang="ts">
	import '../../routes/global.css';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	import type { Event, AuthUser } from '@prisma/client';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(customParseFormat);
	dayjs.extend(utc);
	dayjs.extend(timezone);

	export let user: AuthUser;
	export let schedule: Event[];
	export let settings_timezone: string;

	let currentTime = new Date();
	let groupByDateArray: { day: string; events: Event[] }[] = [];

	// Assumes there are no events occurring on the same day of the week but in different weeks.
	for (let event of schedule) {
		const dayOfWeek = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		][new Date(event.start).getDay()];
		let dayEntry = groupByDateArray.find((entry) => entry.day === dayOfWeek);

		if (!dayEntry) {
			dayEntry = { day: dayOfWeek, events: [] };
			groupByDateArray.push(dayEntry);
		}

		dayEntry.events.push(event);
	}

	let selected: string | null = null;
	let filters = [...new Set(schedule.map((event: Event) => event.type))];

	let url: string;

	onMount(() => {
		url = generateIcsContent(schedule);

		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

{#if schedule.length > 0}
	<div class="topographic-background">
		<h1>Schedule</h1>
		<div class="container">
			<div class="sidebar">
				<h2>Filters</h2>
				<div class="button-container">
					{#each filters as filter}
						<button
							class:active={selected === filter}
							data-name={filter}
							on:click={() => (selected = selected === filter ? null : filter)}
						>
							{filter}
						</button>
					{/each}

					{#if url && schedule.length > 0}
						<button
							><a class="calendar-export" href={url} download="events.ics">Download Schedule</a
							></button
						>{/if}
				</div>
			</div>
			{#each groupByDateArray as { day, events }}
				<div class="column">
					<h2>{day}</h2>
					{#if selected === null || events.some((event) => event.type === selected)}
						{#each events as event}
							{#if selected === null || event.type === selected}
								<div
									class="card card-text"
									class:currentEvent={currentTime >= event.start && currentTime < event.end}
								>
									<div class="flex-row">
										<div>
											<p class="name">{event.name}</p>
											<p class="location">{event.location}</p>
											{#if user?.roles.includes('ADMIN')}
												<p>
													<a class="edit" href="/admin/homepage/schedule/{event.id}">Edit</a>
												</p>
											{/if}
										</div>
										<p class="date">
											{event.start.toLocaleString('en-US', {
												timeZone: settings_timezone,
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											})}
										</p>
										<p class="date-hover">
											from {event.start.toLocaleString('en-US', {
												timeZone: settings_timezone,
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											})} <br /> to {event.end.toLocaleString('en-US', {
												timeZone: settings_timezone,
												hour: 'numeric',
												minute: 'numeric',
												hour12: true,
											})}
										</p>
									</div>

									<p class="description">{event.description}</p>
								</div>
							{/if}
						{/each}
					{:else}
						<p class="empty-events">There are no events that fall under this category.</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.topographic-background {
		padding-bottom: 5rem;
		background: linear-gradient(
				to bottom,
				#1c1c1cff 0%,
				transparent 30%,
				transparent 60%,
				#1c1c1cff 100%
			),
			url('/Topographic Background.svg');
		background-size: 110%;
	}

	.sidebar {
		width: 16rem;
		margin: 0 5px;
	}

	h1 {
		color: var(--white);
		font-size: 64px;
		font-weight: 400;
		margin: 0;
		text-align: center;
		text-shadow: 0 4px 12px black;
		padding-top: 48px;
	}

	h2 {
		color: var(--white);
		font-family: 'Fugaz One';
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	button {
		background-color: var(--white);
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
		color: var(--white);
	}

	p {
		margin: 0 0 0;
	}

	.date,
	.date-hover,
	.name {
		font-size: 18px;
	}

	.location,
	.description {
		font-size: 14px;
	}

	.date-hover,
	.date {
		text-align: right;
		flex-shrink: 0;
	}

	.description {
		padding-top: 3px;
	}

	.description,
	.date-hover {
		display: none;
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
		border: solid var(--accent) 4px;
		padding-bottom: calc(1rem - 4px);
	}

	.card:hover {
		background-color: var(--white);
	}

	.card:hover .description,
	.card:hover .date-hover {
		display: initial;
	}

	.card:hover .date {
		display: none;
	}

	.card-text,
	.empty-events {
		color: var(--white);
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

	@media (max-width: 768px) {
		.topographic-background,
		.card {
			user-select: none;
		}

		h1 {
			font-size: 9.5vw;
		}

		h2 {
			font-size: 6vw;
		}

		.sidebar {
			width: unset;
		}

		.container {
			flex-direction: column;
			margin: 0 10px 0 10px;
		}
	}
</style>
