<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import TextEditor from '$lib/components/text-editor.svelte';
	import { toasts } from '$lib/stores';
	import { trpc } from '$lib/trpc/client';
	import type { Role, Status } from '@prisma/client';

	let { data = $bindable() } = $props();

	// Custom email state
	let userEmails = $state('');
	let subject = $state('');
	let emailBody = $state('');
	let isHTML = $state(false);

	// Blast email state
	type FilterGroup = { role: Role | ''; status: Status | '' };
	let blastFilters: FilterGroup[] = $state([{ role: '', status: '' }]);
	let blastSubject = $state('');
	let blastBody = $state('');
	let blastIsHTML = $state(false);

	const roles = [
		'HACKER',
		'ADMIN',
		'ORGANIZER',
		'JUDGE',
		'VOLUNTEER',
		'SPONSOR',
		'MENTOR',
		'UNDECLARED',
	];
	const statuses = [
		'CREATED',
		'APPLIED',
		'ACCEPTED',
		'REJECTED',
		'WAITLISTED',
		'CONFIRMED',
		'DECLINED',
	];

	async function sendBlast() {
		if (!blastSubject || !blastBody) {
			throw new Error('Subject or email body is empty');
		}

		const filters = blastFilters.map((f) => ({
			role: f.role || undefined,
			status: f.status || undefined,
		})) as { role?: Role; status?: Status }[];

		const emails = await trpc().users.emailsByFilters.query({ filters });
		if (emails.length === 0) {
			toasts.notify('No users match the selected filters');
			return;
		}

		const rejectedEmails: string[] = [];
		let completed = 0;
		const toast = toasts.notify(`Sent 0/${emails.length} emails...`);

		for (let i = 0; i < emails.length; i += 100) {
			const batch = emails.slice(i, i + 100);
			for (let j = 0; j < batch.length; j++) {
				try {
					const success = await trpc().users.sendEmailHelper.mutate({
						emails: batch[j],
						subject: blastSubject,
						emailBody: blastBody,
						isHTML: blastIsHTML,
					});
					completed += success;
					if (!success) rejectedEmails.push(batch[j]);
				} catch {
					rejectedEmails.push(batch[j]);
				}
				toasts.update(toast, `Sent ${completed}/${emails.length} emails`);
				if (j < batch.length - 1) await new Promise((r) => setTimeout(r, 600));
			}
		}

		if (rejectedEmails.length > 0) {
			toasts.notify(`Could not send email(s) to ${rejectedEmails.join(', ')}`);
		}
	}

	async function sendEmailsByUsers() {
		if (!subject || !emailBody || subject.length === 0 || emailBody.length === 0) {
			throw new Error('Subject or email body is empty');
		}

		const rejectedEmails: string[] = [];
		let completed = 0;
		let emails = userEmails
			.split('\n')
			.map((email) => email.trim())
			.filter((email) => email.length > 0);

		const toast = toasts.notify(`Sent 0/${emails.length} emails...`);

		async function sendEmail(email: string) {
			try {
				const successfulEmailRequest = await trpc().users.sendEmailHelper.mutate({
					emails: email,
					subject,
					emailBody,
					isHTML,
				});

				completed += successfulEmailRequest;

				if (!successfulEmailRequest) {
					rejectedEmails.push(email);
					toasts.notify(`Could not send email to ${email}`);
				}

				toasts.update(toast, `Sent ${completed}/${emails.length} emails`);
				return successfulEmailRequest;
			} catch (error) {
				rejectedEmails.push(email);
				return 0;
			}
		}

		for (let i = 0; i < emails.length; i += 100) {
			const slicedEmails = emails.slice(i, i + 100);

			for (let j = 0; j < slicedEmails.length; j++) {
				await sendEmail(slicedEmails[j]);
				if (j < slicedEmails.length - 1) {
					// Resend has a limit of 2 emails per second
					await new Promise((resolve) => setTimeout(resolve, 600));
				}
			}
		}

		if (rejectedEmails.length > 0) {
			toasts.notify(`Could not send email(s) to ${rejectedEmails.join(', ')}`);
		}
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
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

<hr />

<h2>Send Custom Email</h2>
<p>Send a custom email to a group of email addresses. Emails will be sent in batches of 100.</p>

<form
	onsubmit={(e) => {
		e.preventDefault();
		sendEmailsByUsers();
	}}
>
	<label for="customEmails"><h3>Email Addresses</h3></label>
	<textarea
		bind:value={userEmails}
		name="customEmails"
		id="customEmails"
		placeholder="Enter email addresses, one per line"
	></textarea>

	<label for="customSubject"><h3>Subject Line</h3></label>
	<input
		bind:value={subject}
		type="text"
		name="customSubject"
		id="customSubject"
		placeholder="Enter email subject"
	/>

	<label for="customBody"><h3>Email Body</h3></label>
	<div class="toggle-container">
		<Toggle name="customEmailIsHTML" label="Use HTML (Default: Markdown)" bind:checked={isHTML} />
	</div>
	<TextEditor bind:value={emailBody} name="customBody" {isHTML} placeholder="Enter email body" />

	<button type="submit">Send</button>
</form>

<hr />

<h2>Email Blast by Role / Status</h2>
<p>
	Send to users matching any of the filter groups below. "All" in a dropdown means no filter on that
	field.
</p>

<div class="blast-filters">
	{#each blastFilters as filter, i}
		<div class="filter-row">
			<select bind:value={filter.role}>
				<option value="">All Roles</option>
				{#each roles as role}
					<option value={role}>{role}</option>
				{/each}
			</select>
			<select bind:value={filter.status}>
				<option value="">All Statuses</option>
				{#each statuses as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
			{#if blastFilters.length > 1}
				<button type="button" class="remove-btn" onclick={() => blastFilters.splice(i, 1)}>✕</button
				>
			{/if}
		</div>
	{/each}
	<button type="button" onclick={() => blastFilters.push({ role: '', status: '' })}>
		+ Add Filter Group
	</button>
</div>

<form
	onsubmit={(e) => {
		e.preventDefault();
		sendBlast();
	}}
>
	<label for="blastSubject"><h3>Subject Line</h3></label>
	<input
		bind:value={blastSubject}
		type="text"
		id="blastSubject"
		placeholder="Enter email subject"
	/>

	<label for="blastBody"><h3>Email Body</h3></label>
	<div class="toggle-container">
		<Toggle name="blastIsHTML" label="Use HTML (Default: Markdown)" bind:checked={blastIsHTML} />
	</div>
	<TextEditor
		bind:value={blastBody}
		name="blastBody"
		isHTML={blastIsHTML}
		placeholder="Enter email body"
	/>

	<button type="submit">Send Blast</button>
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
	}

	button {
		margin-bottom: 1rem;
	}

	hr {
		margin: 2rem 0;
	}

	.blast-filters {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.filter-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.filter-row select {
		flex: 1;
	}

	.remove-btn {
		margin: 0;
		padding: 0.25rem 0.6rem;
	}
</style>
