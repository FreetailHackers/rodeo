<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import TextEditor from '$lib/components/text-editor.svelte';
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
</svelte:head>

<form
	method="POST"
	action="?/inviteEmail"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="inviteEmail"><h2>Invite Email with Pre-Loaded Roles</h2></label>

	<div class="flex-container">
		<div class="email-subject-container">
			<input class="textbox-margin" name="email" placeholder="Type email here" required />
			<input class="textbox-margin" name="subject" value="Invitation to Rodeo" readonly />
		</div>
		<div class="multi-select">
			<select name="roles" required multiple>
				<option value="HACKER">Hacker</option>
				<option value="ORGANIZER">Organizer</option>
				<option value="JUDGE">Judge</option>
				<option value="VOLUNTEER">Volunteer</option>
				<option value="SPONSOR">Sponsor</option>
			</select>
		</div>
	</div>
	<!-- <MarkdownEditor placeholder="Type email body here" name="emailBody" required /> -->

	<button id="invite-email" type="submit">Send</button>
</form>

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
	<div class="toggle-container">
		<Toggle
			name="submitFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.submitIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.submitTemplate}
		name="submitTemplate"
		isHTML={data.settings.submitIsHTML}
	/>

	<label for="acceptanceTemplate"><h2>Acceptance Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="acceptFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.acceptIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.acceptTemplate}
		name="acceptTemplate"
		isHTML={data.settings.acceptIsHTML}
	/>

	<label for="rejectTemplate"><h2>Rejection Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="rejectFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.rejectIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.rejectTemplate}
		name="rejectTemplate"
		isHTML={data.settings.rejectIsHTML}
	/>

	<label for="waitlistTemplate"><h2>Waitlist Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="waitlistFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.waitlistIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.waitlistTemplate}
		name="waitlistTemplate"
		isHTML={data.settings.waitlistIsHTML}
		id="waitlistTemplate"
	/>

	<label for="RSVPTemplate"><h2>Confirm Attendance Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="confirmFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.confirmIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.confirmTemplate}
		name="confirmTemplate"
		isHTML={data.settings.confirmIsHTML}
		id="confirmTemplate"
	/>

	<label for="withdrawTemplate"><h2>Decline Attendance Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="declineFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.declineIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.declineTemplate}
		name="declineTemplate"
		isHTML={data.settings.declineIsHTML}
		id="declineTemplate"
	/>

	<label for="withdrawalWarningTemplate"><h2>Withdrawal Warning Email Template</h2></label>
	<div class="toggle-container">
		<Toggle
			name="withdrawFormType"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.withdrawIsHTML}
		/>
	</div>
	<TextEditor
		value={data.settings.withdrawalWarningTemplate}
		name="withdrawalWarningTemplate"
		isHTML={data.settings.withdrawIsHTML}
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

	.toggle-container {
		margin-bottom: 1rem;
	.textbox-margin {
		margin-bottom: 1%;
		flex: 1;
		box-sizing: border-box;
	}

	.flex-container {
		display: flex;
		flex-direction: row;
	}

	button {
		margin-bottom: 1rem;
	}

	.email-subject-container {
		display: flex;
		flex-direction: column;
		flex: 1;
		margin-right: 1%;
	}

	.multi-select {
		display: flex;
		align-items: center;
		max-width: 100%;
		margin-bottom: 1%;
	}

	.multi-select select[multiple] {
		height: auto;
		overflow-y: auto;
		width: 100%;
		box-sizing: border-box;
	}
</style>
