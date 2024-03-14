<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions';
	import Toggle from '$lib/components/toggle.svelte';
	import Graph from './line-graph.svelte';
	export let data;

	let applicationOpenStatus = data.settings.applicationOpen;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Admissions</title>
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

	<Toggle
		name="applicationOpen"
		label="Accept new applications"
		bind:checked={applicationOpenStatus}
	/>

	<status-container>
		<label for="applicationDeadline">Hackers must apply before:</label>
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
			>Hackers can only apply if there are at most this number of accounts with status APPLIED,
			ACCEPTED, or CONFIRMED (leaving empty will disable this limit)</label
		>
		<input
			readonly={!applicationOpenStatus}
			type="number"
			name="applicationLimit"
			id="applicationLimit"
			value={data.settings.applicationLimit}
			placeholder="10000"
			min="0"
		/>
	</status-container>

	<label for="statusChangeText"><h2>User Status Count Over Time</h2></label>
	<Graph statusChanges={data.graph} />

	<label for="daysToRSVP">
		<h2>Hackers have this many days after being accepted to RSVP (leave blank to disable RSVPs)</h2>
	</label>
	<input
		type="number"
		id="daysToRSVP"
		name="daysToRSVP"
		placeholder="10"
		min="0"
		value={data.settings.daysToRSVP}
	/>

	<label for="scanActions"><h2>Scan Options</h2></label>
	<textarea
		value={data.settings.scanActions.join('\n')}
		name="scanActions"
		id="scanActions"
		placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
	/>

	<label for="timezone"><h2>Timezone</h2></label>
	<select name="timezone" id="timezone" value={data.settings.timezone}>
		{#each Intl.supportedValuesOf('timeZone') as timezone}
			<option value={timezone}>{timezone}</option>
		{/each}
	</select>

	<button type="submit">Save</button>
</form>

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

	button {
		margin-top: 30px;
		width: 100%;
		margin-bottom: 1rem;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		padding-top: 0;
		text-transform: uppercase;
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

	input[readonly] {
		background-color: rgb(182, 182, 182);
	}
</style>
