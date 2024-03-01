<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { generateIcsContent } from '$lib/ics';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	import { confirmationDialog } from '$lib/actions.js';

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

<div class="bg">
	<div class="container">
		<h1>{data.event.name}&nbsp;<span class="event">{data.event.type}</span></h1>
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
			<div id="header">
				<h1>Edit Event</h1>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={data.event.id} />
					<button
						use:confirmationDialog={{
							text: 'Are you sure you want to delete this event?',
							cancel: 'Cancel',
							ok: 'Delete',
						}}>Delete Event</button
					>
				</form>
			</div>

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
					<MarkdownEditor
						id="description"
						name="description"
						value={data.event.description}
						required
					/>
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
		{/if}
	</div>
</div>

<style>
	#header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	#header > * {
		margin: 1rem 0;
	}

	#header button {
		padding: 0 1rem;
	}

	h1,
	h2 {
		font-family: 'Fugaz One';
	}

	.bg {
		background-color: #303030;
		background-image: url('/Topographic Background (Tilable).svg');
	}

	.container {
		max-width: 60vw;
		color: #f2ebd9;
		margin: auto;
		padding: 1rem;
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
	form,
	#description {
		margin-bottom: 1rem;
	}

	.event {
		background-color: #e1563f;
	}

	a {
		padding-right: 0.5rem;
	}
</style>
