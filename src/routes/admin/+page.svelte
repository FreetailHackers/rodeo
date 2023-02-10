<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import Users from '$lib/components/users.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let saveButtonText = form ?? 'Save';
	let releaseButtonText = 'Release All Pending Decisions';
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
	<button type="submit">{saveButtonText}</button>
</form>

<h1>Pending Decisions</h1>
<form method="POST" action="?/releaseAll" use:enhance>
	<button type="submit" id="release">{releaseButtonText}</button>
</form>

<h2>Accepted</h2>
<Users
	users={data.decisions.accepted.map((decision) => ({ decision, ...decision.user }))}
	actions={['release']}
/>
<h2>Rejected</h2>
<Users
	users={data.decisions.rejected.map((decision) => ({ decision, ...decision.user }))}
	actions={['release']}
/>
<h2>Waitlisted</h2>
<Users
	users={data.decisions.waitlisted.map((decision) => ({ decision, ...decision.user }))}
	actions={['release']}
/>

<style>
	button {
		margin-top: 1rem;
		width: 100%;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		text-transform: uppercase;
	}
</style>
