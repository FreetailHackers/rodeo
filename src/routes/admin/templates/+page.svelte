<script lang="ts">
	import { enhance } from '$app/forms';
	import { Status } from '@prisma/client';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	const statuses: Status[] = Object.keys(Status) as Status[];
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
</svelte:head>

<form
	method="POST"
	action="?/emailByStatus"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="homepageText"><h2>Group Email to Specific Status</h2></label>
	<input class="textbox-margin" name="emailTitle" placeholder="Type email title here" required />
	<MarkdownEditor placeholder="Type email body here" name="emailBody" required />

	<div class="email-status-button-container">
		<select name="status" class="half-button" required>
			{#each statuses as status}
				<option value={status}>{status}</option>
			{/each}
		</select>

		<button class="half-button" id="email-by-status" type="submit">Save</button>
	</div>
</form>

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

	<button id="save-templates" type="submit">Save</button>
</form>

<style>
	label {
		display: block;
	}

	#save-templates {
		margin-top: 20px;
	}

	.email-status-button-container {
		display: flex;
		justify-content: center;
		width: 100%;
	}
	.half-button {
		flex: 1;
		margin-top: 1%;
		max-width: 50%;
	}

	.textbox-margin {
		margin-bottom: 1%;
	}
</style>
