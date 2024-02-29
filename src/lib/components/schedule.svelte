<script lang="ts">
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	import { windowWidth } from '$lib/stores';
	import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
	import timezone from 'dayjs/plugin/timezone';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	dayjs.extend(customParseFormat);
	dayjs.extend(utc);
	dayjs.extend(timezone);

	/* eslint-disable @typescript-eslint/no-explicit-any */
	export let user: any, schedule: any, settings_timezone: string;

	let hoveredId: number | null = null;
	let currentDateTime = new Date();
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	/* eslint-disable @typescript-eslint/no-explicit-any */
	let groupByDateArray: { day: string; events: any[]; hasMatchingEvents: boolean }[] = [];
	let maxEventCountDesktop = 0,
		maxEventCountMobile = 0;

	for (let event of schedule) {
		const dayOfWeek = daysOfWeek[new Date(event.start).getDay()];
		let dayEntry = groupByDateArray.find((entry) => entry.day === dayOfWeek);

		if (!dayEntry) {
			dayEntry = { day: dayOfWeek, events: [], hasMatchingEvents: true };
			groupByDateArray.push(dayEntry);
		}

		dayEntry.events.push(event);

		if (dayEntry.events.length > maxEventCountDesktop) {
			maxEventCountDesktop = dayEntry.events.length;
		}
		maxEventCountMobile++;
	}

	let selected: string | null = null;
	/* eslint-disable @typescript-eslint/no-explicit-any */
	let filters = [...new Set(schedule.map((event: any) => event.type))] as (string | null)[];

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

	let url: string;

	onMount(() => {
		url = generateIcsContent(schedule);
	});

	let minHeight = '';
	$: {
		let isMobile = $windowWidth <= 768;
		let maxEventCount = isMobile ? maxEventCountMobile : maxEventCountDesktop;
		minHeight = `${maxEventCount * (isMobile ? 9 : 8)}em`;
	}
</script>

<div class="topographic-background" style="min-height: {minHeight}">
	<h1>Schedule {minHeight}</h1>
	{#if schedule.length > 0}
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

					{#if url && schedule.length > 0}
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
									class="card card-text {currentDateTime >= event.start &&
									currentDateTime < event.end
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
										<div>
											<p class="name">{event.name}</p>
											<p class="location">{event.location}</p>
											{#if user?.roles.includes('ADMIN')}
												<p>
													<a class="edit" href="/admin/schedule/{event.id}">Edit</a>
												</p>
											{/if}
										</div>
										{#if hoveredId !== event.id}
											<p class="date">
												{event.start.toLocaleString('en-US', {
													timeZone: settings_timezone,
													hour: 'numeric',
													minute: 'numeric',
													hour12: true,
												})}
											</p>
										{:else}
											<p class="date">
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
	{:else}
		<p class="empty-events empty-schedule">There are no events at this time.</p>
	{/if}
</div>

<style>
	.topographic-background {
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		background-size: 110%;
		min-height: 100vh; /* kick footer to bottom of page */
		padding: 3rem 0.5rem 0 0.5rem; /* pad header to correct spot */
		user-select: none; /* Don't let user select the text. Might want to move to mobile only */
	}

	.sidebar {
		width: 16rem;
		margin: 0 10px;
	}

	.empty-schedule {
		padding-top: 1rem;
		text-align: center;
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
		margin: 0 0 0;
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
</style>
