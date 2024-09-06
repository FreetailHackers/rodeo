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

	export let schedule: Event[];
	export let settingsTimezone: string;

	// Assumes there are no events occurring on the same day of the week but in different weeks.
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	let groupByDateArray: { day: string; events: Event[] }[] = [];
	for (let event of schedule) {
		const dayOfWeek =
			daysOfWeek[
				new Date(
					// Either event.start or event.end is guaranteed to be non-null
					event.start !== null ? event.start : event.end!
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
		function getHour(date: Date): string {
			return date.toLocaleString('en-US', {
				timeZone: settingsTimezone,
				hour: 'numeric',
				minute: 'numeric',
				hour12: true,
			});
		}
		if (startDate !== null && endDate !== null) {
			return `${getHour(startDate)} - ${getHour(endDate)}`;
		} else if (startDate !== null) {
			return getHour(startDate);
		} else {
			return getHour(endDate!);
		}
	}

	let selectedFilters: string[] = [];
	let filters = [...new Set(schedule.map((event: Event) => event.type))];
	function toggleFilter(filter: string) {
		if (selectedFilters.includes(filter)) {
			selectedFilters = selectedFilters.filter((f) => f !== filter);
		} else {
			selectedFilters = [...selectedFilters, filter];
		}
	}

	let currentTime = new Date();
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
		'#ff80bb'  // For Fun
	];
</script>

<div class="home-content">
	<h2>What's Next?</h2>
	<div class="button-container">
		{#each filters as filter, index}
			<div class="schedule-button schedule-button-filters">
			<button
				class:selected={selectedFilters.includes(filter)}
				data-name={filter}
				on:click={() => toggleFilter(filter)}
				style="--color: {colors[index]}"
			>
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
						<div class="flex-row">
							<div class="date">
								<p>{getDateString(event.start, event.end)}</p>
							</div>
							<div>
								<p class="name">{event.name}</p>
								<p class="location">{event.location}</p>
							</div>
						</div>

						<p class="description">{event.description}</p>
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

	.column {
		flex: 1 1;
		border: 2px solid black;
		border-radius: 15px;
	}

  .schedule-button-filters {
      display: inline-flex;
      justify-content: space-between;
      margin-bottom: 20px;
			padding: 5px;
  }


  .schedule-button button{
      cursor: pointer;
      font-size: var(--font-size-l);
      align-items: center;
      border: 3px solid transparent; /* Start with no border */
      background: transparent;
      border-radius: 100px;
      display: inline-flex;
      flex: 0 0 auto;
      justify-content: center;
      padding: 5px 10px;
      position: relative;


      color: var(--color);
      font-style: normal;
      font-weight: 500;
  }

  /* Active (clicked) button style */
  .schedule-button button.selected {
      background-color: var(--color); /* Apply background color from the array */
      color: white; /* Text turns white */
      border-color: transparent; /* Remove border when active */
  }

  /* Hover over an active (clicked) button - no effect */
  .schedule-button button.selected:hover {
      background-color: var(--color); /* Maintain the background */
      color: white; /* Maintain white text */
  }

  /* Hover over an inactive (not clicked) button */
  .schedule-button button:not(.selected):hover {
      border-color: var(--color); /* Border turns into the color from the array */
      color: var(--color); /* Text color changes to the same color */
  }




  .day,
	.card {
		padding: 0.75rem;
	}

	.card {
		opacity: 0.5;
		display: flex;
		flex-direction: column;
		border-top: 2px solid black;
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
