<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import Users from '$lib/components/users.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let data;

	let saveButtonText = 'Save';
	let releaseConfirm = false;

	let inputText = data.settings.homepageText;
</script>

<h1>Admin Panel</h1>

<a href="/admin/questions">Registration Questions</a>

<div class="extra-padding">
	<h4>Start typing to see preview:</h4>
	<SvelteMarkdown source={inputText} />
	<form method="POST" action="?/updateHomepage" use:enhance>
		<textarea
			placeholder="Modify the homepage text here (Markdown is supported)."
			name="homepageText"
			id="homepageText"
			rows="100"
			bind:value={inputText}
		/>
		<button class="hometext" type="submit">Update Homepage Text</button>
	</form>
</div>

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

<h2>Accepted</h2>
<Users
	questions={data.questions}
	users={data.decisions.accepted.map((decision) => ({ decision, ...decision.user }))}
	actions={['remove', 'release']}
/>
<h2>Rejected</h2>
<Users
	questions={data.questions}
	users={data.decisions.rejected.map((decision) => ({ decision, ...decision.user }))}
	actions={['remove', 'release']}
/>
<h2>Waitlisted</h2>
<Users
	questions={data.questions}
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

	.extra-padding {
		padding-bottom: 10px;
	}
</style>
