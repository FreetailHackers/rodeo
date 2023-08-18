<script lang="ts">
	import { enhance } from '$app/forms';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';

	export let data;
</script>

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
		value={data.settings.homepageText}
	/>

	<label for="submitTemplate"><h2>Submit Application Email Template</h2></label>
	<MarkdownEditor value={data.settings.submitTemplate} name="submitTemplate" />

	<label for="acceptanceTemplate"><h2>Acceptance Email Template</h2></label>
	<MarkdownEditor value={data.settings.acceptTemplate} name="acceptTemplate" />

	<label for="rejectTemplate"><h2>Rejection Email Template</h2></label>
	<MarkdownEditor value={data.settings.rejectTemplate} name="rejectTemplate" />

	<label for="waitlistTemplate"><h2>Waitlist Email Template</h2></label>
	<MarkdownEditor
		value={data.settings.waitlistTemplate}
		name="waitlistTemplate"
		id="waitlistTemplate"
	/>

	<label for="RSVPTemplate"><h2>Confirm Attendance Email Template</h2></label>
	<MarkdownEditor
		value={data.settings.confirmTemplate}
		name="confirmTemplate"
		id="confirmTemplate"
	/>

	<label for="withdrawTemplate"><h2>Decline Attendance Email Template</h2></label>
	<MarkdownEditor
		value={data.settings.declineTemplate}
		name="declineTemplate"
		id="declineTemplate"
	/>

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
	<button type="submit">Save</button>
</form>

<style>
	label {
		display: block;
	}

	input {
		margin-bottom: 1rem;
	}

	button {
		width: 100%;
	}
</style>
