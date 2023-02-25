<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role, type Event } from '@prisma/client';
	import { trpc } from '$lib/trpc/client';

	let event: Event | null = null;
	let statusText = 'Create New Event';

	async function finishedEditing() {
		if (event !== null) {
			await trpc().deleteEvent.mutate(event.id);
			event = null;
		}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function editEvent(id: number) {
		window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		statusText = 'Edit Event';
		event = await trpc().getEvent.query(id);
	}

	export let data: PageData;
</script>

<h2>Schedule</h2>
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
							<div class="outer-card">
								<div class="inner-card">
									<!-- Element removal box -->
									{#if data.user?.role === Role.ADMIN}
										<div class="button-overlay">
											<form method="POST" action="?/unannounce" use:enhance>
												<input type="hidden" name="id" value={event.id} />
												<button class="deleteButton">❌</button>
											</form>

											<input type="hidden" name="id" value={event.id} />
											<button
												on:click={() => {
													editEvent(event.id);
												}}
												class="deleteButton">✏️</button
											>
										</div>
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
								</div>
							</div>
						</li>
					{/if}
				{/each}
			</div>
			<div class="event-child">
				<h3>Saturday, Mar. 4</h3>
				{#each data.schedule as event}
					{#if event.start.getDay() === 6}
						<li class={event.type}>
							<div class="outer-card">
								<div class="inner-card">
									<!-- Element removal box -->
									{#if data.user?.role === Role.ADMIN}
										<div class="button-overlay">
											<form method="POST" action="?/unannounce" use:enhance>
												<input type="hidden" name="id" value={event.id} />
												<button class="deleteButton">❌</button>
											</form>
											<input type="hidden" name="id" value={event.id} />
											<button
												on:click={() => {
													editEvent(event.id);
												}}
												class="deleteButton">✏️</button
											>
										</div>
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
								</div>
							</div>
						</li>
					{/if}
				{/each}
			</div>
		</div>
	</ul>
</div>

{#if data.user?.role === Role.ADMIN}
	<h2>{statusText}</h2>
	<form method="POST" action="?/schedule" use:enhance>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required value={event?.name ?? ''} />

		<label for="description">Description</label>
		<textarea id="description" name="description" required value={event?.description ?? ''} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="start">Start Time</label>
		<input
			type="datetime-local"
			id="start"
			name="start"
			required
			value={event?.start.toLocaleString('sv') ?? ''}
		/>

		<label for="end">End Time</label>
		<input
			type="datetime-local"
			id="end"
			name="end"
			required
			value={event?.end.toLocaleString('sv') ?? ''}
		/>

		<label for="location">Location</label>
		<input type="text" id="location" name="location" required value={event?.location ?? ''} />

		<Dropdown
			value={event?.type ?? ''}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button on:click={finishedEditing} type="submit">Save</button>
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

	div.outer-card {
		display: table;
		width: 100%;
	}

	div.inner-card {
		display: table-cell;
		vertical-align: middle;
		position: relative;
		z-index: 0;
	}

	.button-overlay {
		display: flex;
		padding-bottom: 0;
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

	.deleteButton {
		background-color: #0000008f;
		width: 50px;
		color: #ffffff;
		border: none;
		border-radius: 5px;
		padding: 5px;
		margin: 15px;
	}

	.deleteButton:hover {
		background-color: #972626;
	}
</style>
