<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';

	export let data;

	let releaseConfirm = false;
</script>

<h1>Admin Panel</h1>

<a href="/admin/questions">Registration Questions</a>
<br />
<br />

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

	<label for="homepageText">Homepage Text: </label>
	<textarea
		placeholder="Modify the homepage text here (Markdown is supported)."
		name="homepageText"
		id="homepageText"
		rows="100"
		value={data.settings.homepageText}
	/>

	<label for="submitTemplate">Submit Application Email Template: </label>
	<textarea value={data.settings.submitTemplate} name="submitTemplate" id="submitTemplate" />

	<label for="acceptanceTemplate">Acceptance Email Template: </label>
	<textarea value={data.settings.acceptTemplate} name="acceptTemplate" id="acceptTemplate" />

	<label for="rejectTemplate">Rejection Email Template: </label>
	<textarea value={data.settings.rejectTemplate} name="rejectTemplate" id="rejectTemplate" />

	<label for="waitlistTemplate">Waitlist Email Template: </label>
	<textarea value={data.settings.waitlistTemplate} name="waitlistTemplate" id="waitlistTemplate" />

	<label for="RSVPTemplate">Confirm Attendance Email Template: </label>
	<textarea value={data.settings.confirmTemplate} name="confirmTemplate" id="confirmTemplate" />

	<label for="withdrawTemplate">Decline Attendance Email Template: </label>
	<textarea value={data.settings.declineTemplate} name="declineTemplate" id="declineTemplate" />

	<label for="confirmBy">
		Accepted hackers must confirm by (leave empty if confirmation is not required):
	</label>
	<input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
	<input
		type="datetime-local"
		id="confirmBy"
		name="confirmBy"
		value={data.settings.confirmBy?.toLocaleString('sv').replace(' ', 'T').slice(0, -3)}
	/>
	<button type="submit">Save</button>
</form>

<h1>Pending Decisions</h1>
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
	button {
		width: 100%;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		text-transform: uppercase;
	}
</style>
