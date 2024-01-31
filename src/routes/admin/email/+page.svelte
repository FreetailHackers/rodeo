<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Status } from '@prisma/client';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	import { trpc } from '$lib/trpc/client';
	import { toasts } from '$lib/stores';
	import { sendEmails } from '$lib/trpc/email';
	const statuses: Status[] = Object.keys(Status) as Status[];
	export let data;

	let key = $page.url.searchParams.get('key') ?? 'status';
	let searchFilter = $page.url.searchParams.get('searchFilter') ?? '';

	async function sendEmailsByStatus() {
		let search = document.getElementsByName('status')[0].innerHTML as string;
		let subject = document.getElementsByName('subject')[0].innerHTML as string;
		let emailBody = document.getElementsByName('emailBody')[0].innerHTML as string;

		// gets all the relevant email addresses based on selected status
		const allEmails = await trpc().users.emails.query({ key, search, searchFilter });
		let completed = 0;
		const toast = toasts.notify(`Downloading files (0/${allEmails.length} completed)...`);

		for (let i = 0; i < allEmails.length; i += 100) {
			const emails = allEmails.slice(i, i + 100);
			sendEmails(emails, subject, emailBody);
			completed++;
			toasts.update(toast, `Downloading files (${completed}/${allEmails.length} completed)...`);
		}
		toasts.update(toast, 'Download complete!');
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
</svelte:head>

<!-- <form
    method="POST"
    action="?/emailByStatus"
    use:enhance={() => {
        return async ({ update }) => {
            update({ reset: false });
        };
    }}
>
    <label for="homepageText"><h2>Group Email to Specific Status</h2></label>

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
    <button id="email-by-status" on:click={sendEmailsByStatus}>Send</button> -->
<!-- </form> -->

<label for="homepageText"><h2>Group Email to Specific Status</h2></label>

<div class="flex-container">
	<input class="textbox-margin" name="subject" placeholder="Type email subject here" required />
	<select name="status" required>
		{#each statuses as status}
			<option value={status}>{status}</option>
		{/each}
	</select>
</div>
<MarkdownEditor placeholder="Type email body here" name="emailBody" required />

<!-- <button id="email-by-status" type="submit">Send</button> -->
<button id="email-by-status" on:click={sendEmailsByStatus}>Send</button>

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

	.textbox-margin {
		margin-bottom: 1%;
		flex: 1;
	}

	.flex-container {
		display: flex;
	}
</style>
