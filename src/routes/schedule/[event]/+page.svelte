<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role, type Event } from '@prisma/client';
	import { onMount } from 'svelte';
	import type { ActionData } from './$types';
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
		start: [number, number, number, number, number];
		end: [number, number, number, number, number];
	}

	let icsData: calEvent[] = [];

	let url: string;

	onMount(() => {
		const icsEvent = {
			title: data.event.name,
			start: dateToIcsArray(data.event.start),
			end: dateToIcsArray(data.event.end),
			description: data.event.description,
			location: data.event.location,
		};
		icsData.push(icsEvent);
		url = generateIcsContent(icsData);
	});
</script>

<h1>{data.event.name}&nbsp;<span class={data.event.type}>{data.event.type}</span></h1>
<h2>📍&nbsp;{data.event.location}</h2>
<h2>
	🕒&nbsp;
	{data.event.start.toLocaleString('en-US', {
		day: 'numeric',
		weekday: 'long',
		month: 'long',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	})} -
	{#if data.event.start.toDateString() === data.event.end.toDateString()}
		{data.event.end.toLocaleString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})}
	{:else}
		{data.event.end.toLocaleString('en-US', {
			day: 'numeric',
			weekday: 'long',
			month: 'long',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})}
	{/if}
</h2>
<p>{data.event.description}</p>

<a href="/schedule/">Back to Schedule</a>
{#if url}
	<a href={url} download="event.ics">Add to Calendar</a>
{/if}

{#if data.user?.role === Role.ADMIN}
	<hr />
	<h1>Edit Event</h1>
	<form
		method="POST"
		action="?/saveEdit"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<input type="hidden" name="id" value={data.event.id} />

		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={data.event.name} />

		<label for="description">Description</label>
		<textarea id="description" name="description" required value={data.event.description} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={data.event.start.toLocaleString('sv')}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={data.event.end.toLocaleString('sv')}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={data.event.location} />

		<Dropdown
			value={data.event.type}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button type="submit">Save</button>
	</form>
{/if}

<style>
	h1 {
		display: inline;
	}

	span {
		display: inline-block;
		vertical-align: middle;
		white-space: nowrap;
		text-align: center;
		padding: 6px;
		font-size: small;
		border-radius: 20px;
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

	a {
		padding-right: 0.5rem;
	}
</style>
