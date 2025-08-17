<script lang="ts">
	import '../../routes/global.css';
	import { onMount } from 'svelte';
	import type { Event } from '@prisma/client';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import customParseFormat from 'dayjs/plugin/customParseFormat';

	dayjs.extend(customParseFormat);
	dayjs.extend(utc);
	dayjs.extend(timezone);

	interface Props {
		schedule: Event[];
		settingsTimezone: string;
	}

	let { schedule, settingsTimezone }: Props = $props();

	// Assumes there are no events occurring on the same day of the week but in different weeks.
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const groupByDateArray: { day: string; events: Event[] }[] = [];
	for (let event of schedule) {
		const dayOfWeek =
			daysOfWeek[
				new Date(
					// Either event.start or event.end is guaranteed to be non-null
					event.start !== null ? event.start : event.end!,
				).getDay()
			];

		let dayEntry = groupByDateArray.find((entry) => entry.day === dayOfWeek);
		if (!dayEntry) {
			dayEntry = { day: dayOfWeek, events: [] };
			groupByDateArray.push(dayEntry);
		}

		dayEntry.events.push(event);
	}

	function getDateString(startDate: Date | null, endDate: Date | null): string {
		function getHour(date: Date, includePeriod: boolean): string {
			return date.toLocaleString('en-US', {
				timeZone: settingsTimezone,
				hour: 'numeric',
				minute: 'numeric',
				hour12: includePeriod,
			});
		}
		if (startDate !== null && endDate !== null) {
			const startHour = getHour(startDate, true);
			const endHour = getHour(endDate, true);
			return startHour + ' -\n' + endHour;
		} else if (startDate !== null) {
			return getHour(startDate, true);
		} else {
			return getHour(endDate!, true);
		}
	}

	let selectedFilters: string[] = $state([]);
	const filters = [...new Set(schedule.map((event: Event) => event.type))];
	function toggleFilter(filter: string) {
		if (selectedFilters.includes(filter)) {
			selectedFilters = selectedFilters.filter((f) => f !== filter);
		} else {
			selectedFilters = [...selectedFilters, filter];
		}
	}

	let currentTime = $state(new Date());
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});

	const colors = [
		'#0773a6', // Required
		'#6da540', // Event
		'#ffc144', // Food
		'#ff80bb', // For Fun
	];
</script>

<div class="home-content">
	<h1>What's Next?</h1>
	<div class="button-container">
		{#each filters as filter, index}
			<div class="schedule-button schedule-button-filters">
				<button
					class:selected={selectedFilters.includes(filter)}
					data-name={filter}
					onclick={() => toggleFilter(filter)}
					style="--color: {colors[index]}"
				>
					<span class="dot">●</span>
					{filter}
				</button>
			</div>
		{/each}
	</div>
	<div class="container">
		{#each groupByDateArray as { day, events }}
			<div class="column">
				<h3 class="day">{day}</h3>
				{#each events as event}
					<div
						class:selected={selectedFilters.length === 0 || selectedFilters.includes(event.type)}
						class:currentEvent={event.start !== null &&
							event.end !== null &&
							event.start <= currentTime &&
							currentTime < event.end}
						class="card card-text"
					>
						<div class="event">
							<div class="date">
								<p>{getDateString(event.start, event.end)}</p>
							</div>
							<div class="separator"></div>
							<div class="details">
								<p class="name">{event.name}</p>
								<p class="location">{event.location}</p>
								<p class="description">{event.description}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.container {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
	}

	.event {
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}

	.date {
		align-self: flex-start;
		flex-basis: 5em;
		font-weight: bold;
	}

	.separator {
		border: 1px solid black;
	}

	.name {
		font-weight: bold;
	}

	.details {
		flex: 1;
	}

	.details p {
		margin: 0;
	}

	.location {
		color: var(--dark-grey);
		padding-top: 5px;
		padding-bottom: 8px;
	}

	.description {
		color: var(--dark-grey);
	}

	.column {
		flex: 1 1;
		border: 3px solid black;
		border-radius: 15px;
	}

	.button-container {
		gap: 10px;
		margin-bottom: 20px;
	}

	.schedule-button-filters {
		display: inline-flex;
		padding: 5px;
	}

	.dot {
		font-size: 1.5em;
		margin-right: 0.25em;
	}

	/* Active filter */
	.schedule-button button {
		align-items: center;
		border: 3px solid var(--color);
		background: var(--color);
		border-radius: 100px;
		display: inline-flex;
		flex: 0 0 auto;
		padding: 0px 10px 3px 10px;

		color: var(--white);
	}

	/* Inactive filter */
	.schedule-button button:not(.selected) {
		background-color: transparent;
		color: var(--color);
		border-color: transparent;
	}

	/* Hover over inactive filter */
	.schedule-button button:not(.selected):hover {
		border-color: var(--color);
		color: var(--color);
	}

	.day {
		margin: 1em 1.5em;
		color: var(--black);
	}

	.card {
		padding: 1.5rem 1rem 1rem 1rem;
	}

	.card {
		opacity: 0.5;
		display: flex;
		flex-direction: column;
		border-top: 3px solid black;
	}

	.card.selected {
		opacity: 1;
	}

	p {
		margin: 0;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			align-items: stretch;
		}

		.card {
			user-select: none;
		}
	}
</style>
