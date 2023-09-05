<script lang="ts">
	import { enhance } from '$app/forms';
	import Graph from '../admin/line-graph.svelte';
	import Toggle from '$lib/components/toggle.svelte';
	export let data;

	let releaseConfirm = false;
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
	<Toggle
		name="applicationOpen"
		label="Accept new applications"
		checked={data.settings.applicationOpen}
	/>

	<label for="statusChangeText"><h2>User Status Count Over Time</h2></label>
	<Graph statusChanges={data.graph} />

	<label for="confirmBy">
		<h2>RSVP deadline (leaving empty will disable RSVPs):</h2>
	</label>
	<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
	<input
		type="datetime-local"
		id="confirmBy"
		name="confirmBy"
		value={data.settings.confirmBy?.toLocaleString('sv').replace(' ', 'T').slice(0, -3)}
	/>

	<label for="scanActions"><h2>Scan Options</h2></label>
	<textarea
		value={data.settings.scanActions.join('\n')}
		name="scanActions"
		id="scanActions"
		placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
	/>

	<button type="submit">Save</button>
</form>

<h2>Pending Decisions</h2>
<form
	method="POST"
	action="?/release"
	use:enhance={({ cancel }) => {
		if (!releaseConfirm) {
			cancel();
			releaseConfirm = true;
		} else {
			releaseConfirm = false;
		}
	}}
>
	{#if releaseConfirm}
		<button type="submit" id="release">Are you sure? This is irreversible!</button>
	{:else}
		<button type="submit" id="release"
			>Release all {Object.values(data.decisions).reduce((sum, array) => sum + array.length, 0)} pending
			decisions</button
		>
	{/if}
</form>

<style>
	form {
		padding-top: 10px;
	}

	button {
		margin-top: 30px;
		width: 100%;
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
</style>
