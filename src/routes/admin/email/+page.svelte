<script lang="ts">
	import { enhance } from '$app/forms';
	import { Status } from '@prisma/client';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	const statuses: Status[] = Object.keys(Status) as Status[];
	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Email Templates</title>
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
	<label for="groupEmail"><h2>Group Email to Specific Status</h2></label>

	<div class="flex-container">
		<input class="textbox-margin" name="subject" placeholder="Type email subject here" required />
		<select name="status" required>
			{#each statuses as status}
				<option value={status}>{status}</option>
			{/each}
		</select>
	</div>
	<MarkdownEditor placeholder="Type email body here" name="emailBody" required />

	<button id="email-by-status" type="submit">Send</button>
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
	button {
		margin-top: 20px;
	}

	label {
		display: block;
	}

	#save-templates {
		margin-top: 20px;
	}

	.textbox-margin {
		margin-bottom: 1%;
		flex: 1;
	}

	.flex-container {
		display: flex;
	}

	button {
		margin-bottom: 1rem;
	}
</style>
