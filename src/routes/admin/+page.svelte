<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions';
	import Toggle from '$lib/components/toggle.svelte';
	import Graph from './line-graph.svelte';
	export let data;

	let applicationOpenStatus = data.settings.applicationOpen;
	let customLunchGroups = true;
</script>

<svelte:head>
	<title>Rodeo | Admin - Admissions</title>
</svelte:head>

<form
	method="POST"
	action="?/settings"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="applicationStatus"><h2>Application Status</h2></label>

	<div class="flex-row">
		<Toggle
			name="applicationOpen"
			label="Accept new applications"
			bind:checked={applicationOpenStatus}
			isLeft={true}
		/>
	</div>

	<status-container>
		<label for="hackathonStartDate">Hackathon Start Date:</label>
		<input
			type="datetime-local"
			name="hackathonStartDate"
			id="hackathonStartDate"
			value={data.settings.hackathonStartDate
				?.toLocaleString('sv', { timeZone: data.settings.timezone })
				.replace(' ', 'T')
				.slice(0, -3)}
		/>
	</status-container>

	<status-container>
		<label for="applicationDeadline">Application will close on</label>
		<input
			readonly={!applicationOpenStatus}
			type="datetime-local"
			name="applicationDeadline"
			id="applicationDeadline"
			value={data.settings.applicationDeadline
				?.toLocaleString('sv', { timeZone: data.settings.timezone })
				.replace(' ', 'T')
				.slice(0, -3)}
		/>
	</status-container>

	<status-container>
		<label for="applicationLimit"
			>Applications close when the total number of APPLIED, ACCEPTED, or CONFIRMED accounts reaches
			this limit</label
		>
		<input
			readonly={!applicationOpenStatus}
			type="number"
			name="applicationLimit"
			id="applicationLimit"
			value={data.settings.applicationLimit}
			placeholder="Leave empty to disable"
			min="0"
		/>
	</status-container>

	<label for="statusChangeText"><h2>User Status Over Time</h2></label>
	<Graph statusChanges={data.graph} />

	<status-container>
		<label for="daysToRSVP"> Hackers must RSVP within this many days after acceptance </label>
		<input
			type="number"
			id="daysToRSVP"
			name="daysToRSVP"
			placeholder="Leave empty to disable"
			min="0"
			value={data.settings.daysToRSVP}
		/>
	</status-container>

	<status-container>
		<label for="timezone">Timezone</label>
		<select name="timezone" id="timezone" value={data.settings.timezone}>
			{#each Intl.supportedValuesOf('timeZone') as timezone}
				<option value={timezone}>{timezone}</option>
			{/each}
		</select>
	</status-container>

	<label for="scanActions"><h2>Scan Options</h2></label>
	<textarea
		value={data.settings.scanActions.join('\n')}
		name="scanActions"
		id="scanActions"
		placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
	/>

	<button type="submit">Save</button>
</form>

<div class="flex-row-space-between">
	<h2>Split Hackers Into Lunch Groups</h2>
	<Toggle
		name="Custom Lunch Group names"
		label="Set Custom Lunch Group"
		bind:checked={customLunchGroups}
	/>
</div>

{#if customLunchGroups}
	<form method="POST" action="?/splitCustomGroups" use:enhance>
		<input
			type="text"
			id="splitGroups"
			name="splitGroups"
			placeholder="Group A, Group B, Group C, ..."
			pattern="^[A-Za-z0-9\s]+(,\s*[A-Za-z0-9\s]+)*$"
			title="Names must be alphanumeric in the form: 'Group 1', 'Group 2', 'Group 3', ..."
			required
		/>
		<button type="submit">Split Groups</button>
	</form>
{:else}
	<form method="POST" action="?/splitGroups" use:enhance>
		<input
			type="number"
			id="maxGroups"
			name="maxGroups"
			placeholder="Set Max Number of Groups"
			min="1"
			max="10"
		/>
		<button type="submit">Split Groups</button>
	</form>
{/if}

<h2>Pending Decisions</h2>
<form method="POST" action="?/release" use:enhance>
	<button
		id="release"
		use:confirmationDialog={{
			text: 'Are you sure you want to release all pending decisions?',
			cancel: 'Cancel',
			ok: 'OK',
		}}
		>Release all {Object.values(data.decisions).reduce((sum, array) => sum + array.length, 0)} pending
		decisions</button
	>
</form>

<style>
	form {
		padding-top: 10px;
	}

	.flex-row {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1em;
	}

	.flex-row-space-between {
		display: flex;
		justify-content: space-between;
	}

	#splitGroups {
		margin-right: 3em;
		min-width: 50%;
	}

	#maxGroups {
		margin-right: 3em;
		max-width: 40%;
	}

	button {
		margin-top: 30px;
		width: 100%;
		margin-bottom: 1rem;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		margin-bottom: 1rem;
		text-transform: uppercase;
		background-color: var(--red);
		height: auto;
		min-height: 3rem;
	}

	#release:hover {
		color: white;
		background-color: #ff5555;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input,
	textarea {
		flex-grow: 1;
		width: 100%;
	}

	status-container {
		margin-top: 1rem;
	}
	select {
		width: 100%;
	}

	input[readonly] {
		background-color: rgb(182, 182, 182);
	}
</style>
