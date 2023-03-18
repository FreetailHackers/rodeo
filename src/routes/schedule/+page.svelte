<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role, type Event } from '@prisma/client';
	import type { ActionData } from './$types';

	export let data;
	export let form: ActionData;

	let editedEvent: Event | null = null;
	$: if (form !== null) {
		editedEvent = form;
		if (browser) {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		}
	}
</script>

<h1>Schedule</h1>
<div class="schedule">
	<div class="legend">
		<mark class="Regular-Event">Regular Event</mark>
		<mark class="Key-Event">Key Event</mark>
		<mark class="Speaker-Event">Speaker Event</mark>
		<mark class="Fun-Event">Fun Event</mark>
		<mark class="Workshop">Workshop</mark>
	</div>
	<ul>
		<div class="event-container">
			<div class="event-child">
				<h3>Friday, Mar. 3</h3>
				{#each data.schedule as event}
					{#if event.start.getDay() === 5}
						<li class={event.type}>
							<!-- Element removal box -->
							{#if data.user?.role === Role.ADMIN}
								<form method="POST" use:enhance>
									<input type="hidden" name="id" value={event.id} />
									<button type="submit" formaction="?/delete">❌</button>
									<button type="submit" formaction="?/edit">✏</button>
								</form>
							{/if}
							<!-- Event box -->
							<h3 class="event-name">{event.name} ({event.location})</h3>
							<h4>
								{event.start.toLocaleString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
									hour12: true,
								})} - {event.end.toLocaleString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
									hour12: true,
								})}
							</h4>
							<h5>{event.description}</h5>
						</li>
					{/if}
				{/each}
			</div>
			<div class="event-child">
				<h3>Saturday, Mar. 4</h3>
				{#each data.schedule as event}
					{#if event.start.getDay() === 6}
						<li class={event.type}>
							<!-- Element removal box -->
							{#if data.user?.role === Role.ADMIN}
								<form method="POST" use:enhance>
									<input type="hidden" name="id" value={event.id} />
									<button type="submit" formaction="?/delete">❌</button>
									<button type="submit" formaction="?/edit">✏️️</button>
								</form>
							{/if}
							<!-- Event box -->
							<h3 class="event-name">{event.name} ({event.location})</h3>
							<h4>
								{event.start.toLocaleString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
									hour12: true,
								})} - {event.end.toLocaleString('en-US', {
									hour: 'numeric',
									minute: 'numeric',
									hour12: true,
								})}
							</h4>
							<h5>{event.description}</h5>
						</li>
					{/if}
				{/each}
			</div>
		</div>
	</ul>
</div>

{#if data.user?.role === Role.ADMIN}
	<h2>{editedEvent == null ? 'Create New Event' : 'Edit Event'}</h2>
	<form method="POST" action={editedEvent == null ? '?/create' : '?/saveEdit'} use:enhance>
		<input type="hidden" name="id" value={editedEvent?.id} />

		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={editedEvent?.name ?? ''} />

		<label for="description">Description</label>
		<textarea id="description" name="description" required value={editedEvent?.description ?? ''} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={editedEvent?.start.toLocaleString('sv') ?? ''}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={editedEvent?.end.toLocaleString('sv') ?? ''}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={editedEvent?.location ?? ''} />

		<Dropdown
			value={editedEvent?.type ?? ''}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button type="submit">Save</button>
	</form>
{/if}

<style>
	@media only screen and (min-width: 600px) {
		div.event-container {
			display: flex;
			flex-direction: row;
			margin-bottom: 50px;
			align-items: flex-start;
			justify-content: space-between;
			width: 100%;
		}

		div.event-child {
			display: flex;
			padding: 10px;
			flex-direction: column;
			width: 450px;
			text-align: center;
		}

		.legend {
			display: absolute;
			flex-direction: row;
			justify-content: space-between;
			width: 100%;
		}
	}

	.schedule {
		padding: 20px;
		background-color: #f5f2ee;
	}

	mark {
		padding-left: 5px;
		padding-right: 5px;
		text-align: center;
	}

	h3,
	h4,
	h5 {
		text-align: center;
	}

	ul {
		padding: 0;
		list-style-type: none;
	}

	li {
		margin: 10px 0;
	}

	.legend {
		display: inline-block;
		margin: 0 auto;
		text-align: center;
		justify-content: center;
	}

	h3.event-name {
		text-decoration: underline;
		text-decoration-thickness: 2px;
	}

	ul {
		padding: 0;
		list-style-type: none;
	}

	li {
		margin: 10px 0;
	}

	.Key-Event {
		background-color: #a8e6cf;
	}

	.Workshop {
		background-color: #dcedc1;
	}

	.Speaker-Event {
		background-color: #ffd3b6;
	}

	.Fun-Event {
		background-color: #ffaaa5;
	}

	.Regular-Event {
		background-color: #f58bff;
	}

	/* Admin view */

	li form {
		flex-direction: row-reverse;
	}

	li button {
		background-color: #0000008f;
		width: 50px;
		color: #ffffff;
		border: none;
		padding: 5px;
		margin: 15px 15px 0 0;
	}

	li button:hover {
		background-color: #972626;
	}
</style>
