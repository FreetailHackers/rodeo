<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import Users from '$lib/components/users.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let saveButtonText = 'Save';
	let releaseConfirm = false;

	// Options for demographic questions
	let genderOptions = ['Male', 'Female', 'Nonbinary', 'Other', 'Prefer not to say'];
	let raceOptions = [
		'American Indian or Alaskan Native',
		'Asian',
		'Black or African American',
		'Hispanic',
		'Native Hawaiian or Pacific Islander',
		'White',
		'Other',
	];
</script>

<h1>Admin Panel</h1>

<form
	method="POST"
	action="?/settings"
	use:enhance={() => {
		saveButtonText = 'Saving...';
		return async ({ update }) => {
			update({ reset: false });
			// 100 ms delay so people actually see the "Saving..." text
			await new Promise((r) => setTimeout(r, 100));
			saveButtonText = 'Saved!';
		};
	}}
>
	<Toggle
		name="applicationOpen"
		label="Accept new applications"
		checked={data.settings.applicationOpen}
	/>

	<label for="acceptanceTemplate">Acceptance Email Template: </label>
	<textarea
		value={data.settings.acceptanceTemplate}
		name="acceptanceTemplate"
		id="acceptanceTemplate"
	/>
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
	<button type="submit">{saveButtonText}</button>
</form>

<h1>Pending Decisions</h1>
<form
	method="POST"
	action="?/releaseAll"
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

<h2>Stats</h2>
<p>Accepted (pending): {data.decisions.accepted.length}</p>
<ul>
	{#each genderOptions as genderOption}
		<li>
			{(
				(data.decisions.accepted.filter((decision) => decision.user.gender == genderOption).length *
					100) /
				data.decisions.accepted.length
			).toFixed(2)}% - {genderOption}
		</li>
	{/each}
</ul>
<ul>
	{#each raceOptions as raceOption}
		<li>
			{(
				(data.decisions.accepted.filter((decision) => decision.user.race.includes(raceOption))
					.length *
					100) /
				data.decisions.accepted.length
			).toFixed(2)}% - {raceOption}
		</li>
	{/each}
</ul>

<h2>Accepted</h2>
<Users
	users={data.decisions.accepted.map((decision) => ({ decision, ...decision.user }))}
	actions={['remove', 'release']}
/>
<h2>Rejected</h2>
<Users
	users={data.decisions.rejected.map((decision) => ({ decision, ...decision.user }))}
	actions={['remove', 'release']}
/>
<h2>Waitlisted</h2>
<Users
	users={data.decisions.waitlisted.map((decision) => ({ decision, ...decision.user }))}
	actions={['remove', 'release']}
/>

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
