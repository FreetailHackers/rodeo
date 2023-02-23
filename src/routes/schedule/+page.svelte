<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role } from '@prisma/client';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	let schedule = '';
	let description = '';
	let startTime = '';
	let endTime = '';
	let location = '';
	let type = '';
	let text = 'All Fields are Required';

	let submitButtonText = 'SUBMIT';

	function scrollToBottom() {
		const bottomElement = document.getElementById('bottom');
		if (bottomElement) {
			bottomElement.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function scrollToTop() {
		const topElement = document.getElementById('top');
		if (topElement) {
			topElement.scrollIntoView({ behavior: 'smooth' });
		}
	}

	let finishedEditingPopup = false;
	async function finishedEditing() {
		if (editing == true) {
			editing = false;
			submitButtonText = 'SUBMIT';
			text = 'All Fields are Required';
			// call the unannounce function
			await trpc().deleteEvent.mutate(editID);
			finishedEditingPopup = true;
		}
		scrollToTop();
		setTimeout(() => {
			finishedEditingPopup = false;
		}, 2000); // hide the alert after 3 seconds
		invalidateAll();
	}

	let editingPopup = false;
	let editing = false;
	function popupDelay() {
		editingPopup = true;
		setTimeout(() => {
			editingPopup = false;
		}, 500); // hide the alert after 3 seconds
	}

	let editID = 0;
	async function editEvent(id: number) {
		editing = true;
		scrollToBottom();
		editID = id;
		text = 'Edit Event';
		submitButtonText = 'SUBMIT EDIT';
		popupDelay();
		const event = await trpc().getTargetEvent.query(id);
		if (event) {
			schedule = event.name;
			description = event.description;
			startTime = new Date(event.start).toLocaleString('sv').slice(0, -3);
			endTime = new Date(event.end).toLocaleString('sv').slice(0, -3);
			location = event.location;
			type = event.type;
		} else {
			console.log('Error: Event not found');
		}
	}

	export let data: PageData;
</script>

<h2>Schedule</h2>
<div id="top" />
{#if editingPopup}
	<div class="outter-edit">
		<div class="inner-edit">
			<p>Currently Editing Event</p>
		</div>
	</div>
{/if}
{#if finishedEditingPopup}
	<div class="outter-edit">
		<div class="inner-edit">
			<p>Event Successfully Edited!</p>
		</div>
	</div>
{/if}
<div class="schedule">
	<div class="legend">
		<mark class="Regular-Event">Regular Event</mark>
		<mark class="Key-Event">Key Event</mark>
		<mark class="Speaker-Event">Speaker Event</mark>
		<mark class="Fun-Event">Fun Event</mark>
		<mark class="Workshop">Workshop</mark>
	</div>
	<h3>*All times are in Central Time (CT)*</h3>
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
										<div class="button-overlay" style="inblock">
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
	<h2>Schedule Editor: {text}</h2>
	<form method="POST" action="?/schedule" use:enhance>
		<label for="schedule">Schedule Name*</label>
		<input type="text" id="schedule" name="schedule" required bind:value={schedule} />

		<label for="description">Description*</label>
		<textarea id="description" name="description" required bind:value={description} />

		<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
		<label for="startTime">Start Time*</label>
		<input type="datetime-local" id="startTime" name="startTime" required bind:value={startTime} />

		<label for="endTime">End Time*</label>
		<input type="datetime-local" id="endTime" name="endTime" required bind:value={endTime} />

		<label for="location">Location*</label>
		<input type="text" id="location" name="location" required bind:value={location} />

		<Dropdown
			bind:value={type}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button on:click={finishedEditing} type="submit">{submitButtonText}</button>
	</form>
{/if}
<div id="bottom" />

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

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9999;
		color: white;
	}

	mark {
		padding-left: 5px;
		padding-right: 5px;
		text-align: center;
	}

	p {
		color: white;
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

	div.outter-edit {
		background-color: rgba(255, 255, 255, 0.5);
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	div.inner-edit {
		background-color: #bf5700;
		padding: 20px;
		border-radius: 5px;
	}
	div.schedule {
		padding: 20px;
		background-color: #f5f2ee;
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

	li.Key-Event {
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
