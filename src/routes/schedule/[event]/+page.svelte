<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';

	export let data;

	// Calendar functionality
	let url: string;

	onMount(() => {
		url = generateIcsContent([data.event]);
	});
</script>

<svelte:head>
	<title>Rodeo | Schedule - {data.event.name}</title>
</svelte:head>

<h1>{data.event.name}&nbsp;<span class={data.event.type}>{data.event.type}</span></h1>
<h2>📍&nbsp;{data.event.location}</h2>
<h2>
	🕒&nbsp;
	{data.event.start.toLocaleString('en-US', {
		timeZone: data.timezone,
		day: 'numeric',
		weekday: 'long',
		month: 'long',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	})} -
	{#if data.event.start.toDateString() === data.event.end.toDateString()}
		{data.event.end.toLocaleString('en-US', {
			timeZone: data.timezone,
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})}
	{:else}
		{data.event.end.toLocaleString('en-US', {
			timeZone: data.timezone,
			day: 'numeric',
			weekday: 'long',
			month: 'long',
			hour: 'numeric',
			minute: 'numeric',
			hour12: true,
		})}
	{/if}
</h2>
<SvelteMarkdown source={data.event.description} />

<a href="/schedule/">Back to Schedule</a>
{#if url}
	<a href={url} download="event.ics">Add to Calendar</a>
{/if}

{#if data.user?.roles.includes('ADMIN')}
	<hr />
	<h1>Edit Event</h1>
	<form
		method="POST"
		action="?/edit"
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
		<div id="description">
			<MarkdownEditor id="description" name="description" value={data.event.description} required />
		</div>

		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={data.event.start.toLocaleString('sv', { timeZone: data.timezone })}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={data.event.end.toLocaleString('sv', { timeZone: data.timezone })}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={data.event.location} />

		<label for="type">Event Type</label>
		<select name="type" value={data.event.type} required>
			<option value="Regular-Event">Regular Event</option>
			<option value="Key-Event">Key Event</option>
			<option value="Speaker-Event">Speaker Event</option>
			<option value="Fun-Event">Fun Event</option>
			<option value="Workshop">Workshop</option>
		</select>

		<button type="submit">Save</button>
	</form>

	<details>
		<summary><h1>Delete Event</h1></summary>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={data.event.id} />
			<button type="submit"><strong>DELETE EVENT (this cannot be undone!)</strong></button>
		</form>
	</details>
{/if}

<style>
	span {
		display: inline-block;
		vertical-align: middle;
		white-space: nowrap;
		text-align: center;
		padding: 6px;
		font-size: small;
		border-radius: 20px;
	}

	summary h1 {
		display: inline-block;
		vertical-align: middle;
		padding-left: 0.5rem;
	}

	a {
		display: inline-block;
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	select,
	input,
	#description {
		margin-bottom: 1rem;
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
