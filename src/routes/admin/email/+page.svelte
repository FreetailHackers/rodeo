<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Status } from '@prisma/client';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	import { trpc } from '$lib/trpc/client';
	// import { toasts } from '$lib/stores';
	// import { sendEmails } from '$lib/trpc/email';
	const statuses: Status[] = Object.keys(Status) as Status[];
	export let data;

	let search: Status;
	let subject: string;
	let emailBody: string;
	let splitEmailAddress: string[] = [];

	let key = $page.url.searchParams.get('key') ?? 'status';
	let searchFilter = $page.url.searchParams.get('searchFilter') ?? '';

	async function sendEmailsByStatus() {
		// async function sendEmailsByStatusHelper(emails: string[], subject: string, emailBody: string) {
		// 	return trpc().users.sendEmailHelper.mutate({ emails, subject, emailBody });
		// }
		const allEmails = await trpc().users.getEmailsAddresses.query({ key, search, searchFilter });

		// let completed = 0;
		// const toast = toasts.notify(`Sending 0/${allEmails.length} emails`);

		allEmails.forEach((email) => {
			splitEmailAddress.push(`'${email}'`);
		});
		console.log(splitEmailAddress);
		for (let i = 0; i < allEmails.length; i++) {
			// let emailStatus = Promise.allSettled(
			// 	splitEmailAddress.map((emailAddresses) =>
			// 		sendEmailsByStatusHelper([emailAddresses], subject, emailBody)
			// 	)
			// );
			// console.log(emailStatus);
		}
	}

	// async function sendEmailsByStatus() {
	// 	async function sendEmailsByStatusHelper(emails: string[], subject: string, emailBody: string) {
	// 		let status = trpc().users.sendEmailHelper.mutate({emails, subject, emailBody});
	// 	}

	// 	let completed = 0;
	// 	const allEmails = await trpc().users.getEmailsAddresses.query({key, search, searchFilter});
	// 	const toast = toasts.notify(`Sending 0/${allEmails.length} emails`);

	// 	while (allEmails.length > 0) {
	// 		splitEmailAddress.push(allEmails.slice(0, 20));
	// 	}

	// 	for (let i = 0; i < allEmails.length; i++) {
	// 		let emailStatus = Promise.allSettled(splitEmailAddress.map((emailAddresses) => sendEmailsByStatusHelper(emailAddresses, subject, emailBody)));
	// 		emailStatus = emailStatus.filter((emailStat) => emailStat.status === 'fulfilled');
	// 		//TODO cuz im really tired
	// 		/*
	// 		basically, take the statuses adn see how many are fulfilled
	// 		count how many are fulfilled and add that to completed var
	// 		updata toasts
	// 		*/
	// 	}
	// }

	// async function sendEmailsByStatus() {

	// 	// gets all the relevant email addresses based on selected status
	// 	console.log('key ' + key);
	// 	console.log('search ' + search);
	// 	console.log('search filter: ' + searchFilter);

	// 	const allEmails = await trpc().users.getEmailsAddresses.query({ key, search, searchFilter });
	// 	let completed = 0;
	// 	const toast = toasts.notify(`Sending (0/${allEmails.length} emails)...`);

	// 	for (let i = 0; i < allEmails.length; i += 100) {
	// 		emailAddresses = allEmails.slice(i, i + 100);
	// 		trpc().users.sendEmailHelper.mutate({ emailAddresses, subject, emailBody });
	// 		completed += 100;
	// 		toasts.update(toast, `Sending (${completed}/${allEmails.length} emails)...`);
	// 	}
	// 	toasts.update(toast, 'Sent all emails!');
	// }
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
</svelte:head>

<label for="homepageText"><h2>Group Email to Specific Status</h2></label>

<div class="flex-container">
	<input
		class="textbox-margin"
		name="subject"
		placeholder="Type email subject here"
		bind:value={subject}
		required
	/>
	<select name="status" bind:value={search} required>
		{#each statuses as status}
			<option value={status}>{status}</option>
		{/each}
	</select>
</div>
<MarkdownEditor
	placeholder="Type email body here"
	name="emailBody"
	required
	bind:value={emailBody}
/>

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
