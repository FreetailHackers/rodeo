<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	export let data;

	let selected: string;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Homepage</title>
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
	<label for="homepageText"><h2>Homepage Text</h2></label>
	<MarkdownEditor
		placeholder="Modify the homepage text here (Markdown is supported)."
		name="homepageText"
		id="homepageText"
		rows={25}
		value={data.homepageText}
	/>

	<button id="save-homepage-text" type="submit">Save</button>
</form>

<form method="POST" action="?/createEvent" use:enhance>
	<label for="createNewEvent"><h2>Create New Event</h2></label>
	<label for="name">Name</label>
	<input type="text" id="name" name="name" required />

	<label for="description">Description</label>
	<textarea id="description" name="description" required />

	<label for="start">Start Time</label>
	<input type="datetime-local" id="start" name="start" required />

	<label for="end">End Time</label>
	<input type="datetime-local" id="end" name="end" required />

	<label for="location">Location</label>
	<input type="text" id="location" name="location" required />

	<label for="type">Event Type</label>
	<select name="type" required>
		<option value="Regular-Event">Regular Event</option>
		<option value="Key-Event">Key Event</option>
		<option value="Speaker-Event">Speaker Event</option>
		<option value="Fun-Event">Fun Event</option>
		<option value="Workshop">Workshop</option>
	</select>

	<button type="submit">Save</button>
</form>

<form method="POST" action="?/createFAQ" use:enhance>
	<label for="createNewFAQ"><h2>Create New FAQ</h2></label>

	<label for="question">Question</label>
	<input type="text" id="question" name="question" required />

	<label for="answer">Answer</label>
	<MarkdownEditor id="answer" name="answer" required />

	<button class="submit" type="submit">Save</button>
</form>

<form method="POST" action="?/createChallenge" use:enhance>
	<label for="createNewChallenge"><h2>Create New Challenge</h2></label>

	<label for="category">Category</label>
	<input type="text" id="category" name="category" required />

	<label for="challenge">Challenge</label>
	<textarea id="challenge" name="challenge" required />

	<button type="submit">Save</button>
</form>

<form method="POST" action="?/deleteAll" use:enhance>
	<label for="deleteAll"><h2>Delete All</h2></label>
	<select name="deleteAll" id="deleteAll" bind:value={selected}>
		<option value="" disabled selected>Select an element</option>
		<option value="events"> Schedule Events</option>
		<option value="FAQs"> FAQs </option>
		<option value="challenges"> Challenges </option>
	</select>
	<button disabled={selected === ''} use:confirmationDialog>Delete</button>
</form>

<style>
	button {
		margin-top: 20px;
	}

	label {
		display: block;
	}

	#save-homepage-text {
		margin-top: 20px;
	}

	button {
		margin-bottom: 1rem;
	}
</style>
