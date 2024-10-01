<script lang="ts">
	import { enhance } from '$app/forms';
	import { Status } from '@prisma/client';
	import TextEditor from '$lib/components/text-editor.svelte';
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
	<label for="groupEmail"><h2>Group Email to Specific Status</h2></label>

	<div class="flex-container">
		<input class="textbox-margin" name="subject" placeholder="Type email subject here" required />
		<select name="status" required>
			{#each statuses as status}
				<option value={status}>{status}</option>
			{/each}
		</select>
	</div>
	<TextEditor
		placeholder="Type email body here"
		name="emailBody"
		isHTML={data.settings.byStatusIsHTML}
		toggleName="byStatusFormType"
		required
	/>

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

	<TextEditor
		value={data.settings.submitTemplate}
		name="submitTemplate"
		isHTML={data.settings.submitIsHTML}
		toggleName="submitFormType"
	/>

	<label for="acceptanceTemplate"><h2>Acceptance Email Template</h2></label>
	<TextEditor
		value={data.settings.acceptTemplate}
		name="acceptTemplate"
		isHTML={data.settings.acceptIsHTML}
		toggleName="acceptFormType"
	/>

	<label for="rejectTemplate"><h2>Rejection Email Template</h2></label>
	<TextEditor
		value={data.settings.rejectTemplate}
		name="rejectTemplate"
		isHTML={data.settings.rejectIsHTML}
		toggleName="rejectFormType"
	/>

	<label for="waitlistTemplate"><h2>Waitlist Email Template</h2></label>
	<TextEditor
		value={data.settings.waitlistTemplate}
		name="waitlistTemplate"
		isHTML={data.settings.waitlistIsHTML}
		toggleName="waitlistFormType"
		id="waitlistTemplate"
	/>

	<label for="RSVPTemplate"><h2>Confirm Attendance Email Template</h2></label>
	<TextEditor
		value={data.settings.confirmTemplate}
		name="confirmTemplate"
		isHTML={data.settings.confirmIsHTML}
		id="confirmTemplate"
		toggleName="confirmFormType"
	/>

	<label for="withdrawTemplate"><h2>Decline Attendance Email Template</h2></label>
	<TextEditor
		value={data.settings.declineTemplate}
		name="declineTemplate"
		isHTML={data.settings.declineIsHTML}
		id="declineTemplate"
		toggleName="declineFormType"
	/>

	<label for="withdrawalWarningTemplate"><h2>Withdrawal Warning Email Template</h2></label>
	<TextEditor
		value={data.settings.withdrawalWarningTemplate}
		name="withdrawalWarningTemplate"
		isHTML={data.settings.withdrawIsHTML}
		toggleName="withdrawFormType"
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
