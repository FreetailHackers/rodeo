<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { Role } from '@prisma/client';

	export let data: PageData;
</script>

<h2>Schedule</h2>
<div class="schedule">
	<div class="legend">
		<b style="border-right:18px solid #f58bff;" />Regular Event
		<b style="border-right:18px solid #a8e6cf;" />Key Event
		<b style="border-right:18px solid #ffd3b6;" />Speaker Event
		<b style="border-right:18px solid #ffaaa5;" />Fun Event
		<b style="border-right:18px solid #dcedc1;" />Workshop
	</div>
	<h3 style="text-align:center;">*All times are in Central Time (CT)*</h3>
	<ul>
		{#each data.schedule as event}
			<li class={event.type}>
				<div style="display:table; width:100%;">
					<div style="display:table-cell; vertical-align:middle; position:relative; z-index:0; ">
						<!-- Element removal box -->
						{#if data.user?.role === Role.ADMIN}
							<div class="overlay">
								<form method="POST" action="?/unannounce" use:enhance>
									<input type="hidden" name="id" value={event.id} />
									<button class="deleteButton">X</button>
								</form>
							</div>
						{/if}
						<!-- Event box -->
						<h3 class="event-name">{event.name} ({event.location})</h3>
						<h4 style="text-align:center;">
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
						<h5 style="text-align:center;">{event.description}</h5>
					</div>
				</div>
			</li>
		{/each}
	</ul>
</div>

{#if data.user?.role === Role.ADMIN}
	<h2>Schedule Editor: ALL fields are required</h2>
	<form method="POST" action="?/schedule" use:enhance>
		<label for="schedule">Schedule Name*</label>
		<input type="text" id="schedule" name="schedule" required />

		<label for="description">Description*</label>
		<textarea id="description" name="description" required />

		<label for="startTime">Start Time*</label>
		<input type="datetime-local" id="startTime" name="startTime" required />

		<label for="endTime">End Time*</label>
		<input type="datetime-local" id="endTime" name="endTime" required />

		<label for="location">Location*</label>
		<input type="text" id="location" name="location" required />

		<Dropdown
			value={null}
			name="type"
			label="Event Type"
			options={['Key-Event', 'Workshop', 'Speaker-Event', 'Fun-Event', 'Regular-Event']}
			required
		/>

		<button type="submit">Submit</button>
	</form>
{/if}

<style>
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

	.legend {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
	}

	h3.event-name {
		text-align: center;
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

	li.Workshop {
		background-color: #dcedc1;
	}

	li.Speaker-Event {
		background-color: #ffd3b6;
	}

	li.Fun-Event {
		background-color: #ffaaa5;
	}

	li.Regular-Event {
		background-color: #f58bff;
	}

	.deleteButton {
		background-color: #000000;
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
