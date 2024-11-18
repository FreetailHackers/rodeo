<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import Toggle from '$lib/components/toggle.svelte';
	import TextEditor from '$lib/components/text-editor.svelte';
	export let data;
	import { toasts } from '$lib/stores';
	import EventManager from './event-manager.svelte';
	import FAQManager from './faq-manager.svelte';
	import ChallengeManager from './challenge-manager.svelte';

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			if (input.files[0].size > 1024 * 1024) {
				toasts.notify('Error: File size must be under 1MB.');
			}
		}
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Homepage</title>
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
	<TextEditor
		placeholder="Modify the homepage text here (Markdown is supported)."
		name="homepageText"
		id="homepageText"
		isHTML={false}
		rows={25}
		value={data.settings.homepageText}
	/>

	<button id="save-homepage-text" type="submit">Save</button>
</form>

<form
	method="POST"
	action="?/showSections"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="showSections"><h2>Show Homepage Sections</h2></label>
	<div class="toggle-container">
		<Toggle
			name="showAnnouncements"
			label="Show Announcements"
			bind:checked={data.settings.showAnnouncements}
		/>
	</div>
	<div class="toggle-container">
		<Toggle name="showSchedule" label="Show Schedule" bind:checked={data.settings.showSchedule} />
	</div>
	<div class="toggle-container">
		<Toggle name="showFAQ" label="Show FAQ" bind:checked={data.settings.showFAQ} />
	</div>
	<div class="toggle-container">
		<Toggle
			name="showChallenges"
			label="Show Challenges"
			bind:checked={data.settings.showChallenges}
		/>
	</div>
	<div class="toggle-container">
		<Toggle name="showSponsors" label="Show Sponsors" bind:checked={data.settings.showSponsors} />
	</div>
	<button id="save-show-sections" type="submit">Save</button>
</form>

<!-- Events -->
<section>
	<h2>Schedule</h2>
	<form method="POST" action="?/deleteAllEvents" use:enhance>
		<button
			type="submit"
			use:confirmationDialog={{
				text: 'Are you sure you want to delete all events? This cannot be undone!',
				cancel: 'Cancel',
				ok: 'Delete',
			}}>Delete All Events</button
		>
	</form>

	<EventManager scheduleEvent={null} />
	<details>
		<summary>View Event Info</summary>
		<hr />

		{#each data.events as event}
			<h3>{event.name}</h3>
			<p>{event.start} - {event.end} | {event.location}</p>
			<p>Type: {event.type}</p>
			<p>{event.description}</p>
			<EventManager scheduleEvent={event} />
			<form method="POST" action="?/deleteEvent" use:enhance>
				<input type="hidden" name="id" value={event.id} />
				<button type="submit">Delete</button>
			</form>
			<hr />
		{/each}
	</details>
</section>

<!-- FAQs -->
<section>
	<h2>FAQs</h2>
	<form method="POST" action="?/deleteAllFAQs" use:enhance>
		<button
			type="submit"
			use:confirmationDialog={{
				text: 'Are you sure you want to delete all FAQs? This cannot be undone!',
				cancel: 'Cancel',
				ok: 'Delete',
			}}>Delete All FAQs</button
		>
		<FAQManager faq={null} />
		<details>
			<summary>View FAQ Info</summary>
			<hr />

			{#each data.faqs as faq}
				<h3>{faq.question}</h3>
				<p>{faq.answer}</p>
				<FAQManager {faq} />
				<form method="POST" action="?/deleteFAQ" use:enhance>
					<input type="hidden" name="id" value={faq.id} />
					<button type="submit">Delete</button>
				</form>
				<hr />
			{/each}
		</details>
	</form>
</section>

<!-- Challenges -->
<section>
	<h2>Challenges</h2>
	<ChallengeManager challenge={null} />
	<form method="POST" action="?/deleteAllChallenges" use:enhance>
		<button
			type="submit"
			use:confirmationDialog={{
				text: 'Are you sure you want to delete all challenges? This cannot be undone!',
				cancel: 'Cancel',
				ok: 'Delete',
			}}>Delete All Challenges</button
		>
		<details>
			<summary>View Challenge Info</summary>
			<hr />

			{#each data.challenges as challenge}
				<h3>{challenge.title}</h3>
				{#if challenge.prize}
					<p>Prize: {challenge.prize}</p>
				{/if}
				<p>{challenge.description}</p>
				<ChallengeManager {challenge} />
				<form method="POST" action="?/deleteChallenge" use:enhance>
					<input type="hidden" name="id" value={challenge.id} />
					<button type="submit">Delete</button>
				</form>
				<hr />
			{/each}
		</details>
	</form>
</section>

<form method="POST" action="?/createSponsor" use:enhance enctype="multipart/form-data">
	<label for="createNewSponsor"><h2>Create New Sponsor</h2></label>

	<label for="sponsorLogo">Sponsor Logo</label>
	<input
		type="file"
		id="sponsorLogo"
		name="sponsorLogo"
		accept=".jpg, .jpeg, .png, .webp"
		required
		on:change={handleFileChange}
	/>

	<label for="sponsorLink">Sponsor Link</label>
	<input type="url" id="sponsorLink" name="sponsorLink" required />

	<button type="submit">Save</button>
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

	.toggle-container {
		margin-bottom: 1rem;
	}
</style>
