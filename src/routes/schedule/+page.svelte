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
		<b style="border-right:18px solid #f58bff;" />&nbsp; Regular Event
		<b style="border-right:18px solid #a8e6cf;" />&nbsp; Key Event
		<b style="border-right:18px solid #ffd3b6;" />&nbsp; Speaker Event
		<b style="border-right:18px solid #ffaaa5;" />&nbsp; Fun Event
		<b style="border-right:18px solid #dcedc1;" />&nbsp; Workshop
	</div>
	<h3>*All times are in Central Time (CT)*</h3>
	<ul>
		{#each data.schedule as event}
			<li class={event.type}>
				<div style="display:table; width:100%;">
					{#if data.user?.role === Role.ADMIN}
						<form method="POST" action="?/unannounce" use:enhance>
							<input type="hidden" name="id" value={event.id} />
							<button class="deleteButton">X</button>
						</form>
					{/if}

					<div style="display:table-cell; verticl-align:middle;">
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
		<input type="datetime-local" id="endTime" name="endTime" required/>

		<label for="location">Location*</label>
		<input type="text" id="location" name="location" required/>

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
