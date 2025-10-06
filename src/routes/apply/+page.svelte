<script lang="ts">
	import { enhance } from '$app/forms';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import FileInput from '$lib/components/file-input.svelte';
	import { confirmationDialog } from '$lib/actions.js';
	import Dropdown from '$lib/components/dropdown.svelte';
	import { toasts } from '$lib/stores';

	let { data, form } = $props();
	const application = $state(data.user.application as Record<string, any>);

	let applicationForm = $state() as HTMLFormElement;

	let debounceTimer: ReturnType<typeof setTimeout> | undefined = $state();
	let saveButton = $state() as HTMLButtonElement;
	let rsvpSelectedValue: string = $state('');

	let selectedRole = $state(application['selectedRole'] || 'UNDECLARED');

	function applyAs(role: string) {
		selectedRole = role;
	}
</script>

<svelte:head>
	<title>Rodeo | Apply</title>
</svelte:head>

<!-- Application status dialog -->
<div class="main-content">
	<div id="status">
		{#if data.user.authUser.status === 'CREATED'}
			<h1>INCOMPLETE</h1>
			{#if data.settings.applicationDeadline !== null}
				<p>
					You must complete your application by
					<bold
						>{data.settings.applicationDeadline.toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
						})}
					</bold>
					to be considered for admission.
				</p>
			{:else}
				<p>You must complete your application to be considered for admission.</p>
			{/if}
			<div class="applyButtons">
				<button onclick={() => applyAs('Hacker')}>Apply as Hacker</button>
				<button onclick={() => applyAs('Judge')}>Apply as Judge</button>
				<button onclick={() => applyAs('Mentor')}>Apply as Mentor</button>
				<button onclick={() => applyAs('Volunteer')}>Apply as Volunteer</button>
			</div>
		{:else if data.user.authUser.status === 'APPLIED'}
			<h2 class="status-message">You've submitted your application!</h2>
			{#if data.appliedDate !== null}
				<p>
					Submitted on {data.appliedDate.toLocaleDateString('en-US', {
						month: 'numeric',
						day: 'numeric',
						year: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
					})}
				</p>
			{/if}
		{:else if data.user.authUser.status === 'REJECTED'}
			<h2 class="status-message">
				Unfortunately, we do not have the space to offer you admission this year.
			</h2>
		{:else if data.user.authUser.status === 'WAITLISTED'}
			<h2 class="status-message">
				Unfortunately, we do not have the space to offer you admission at this time.
			</h2>
			<p>We will contact you should this situation change.</p>
		{:else if data.user.authUser.status === 'ACCEPTED'}
			{#if data.rsvpDeadline === null || new Date() < data.rsvpDeadline}
				<h2 class="status-message">
					You’ve been accepted!<br />
					RSVP to confirm your attendance :)
				</h2>
				{#if data.rsvpDeadline}
					<div class="rsvp-deadline">
						<p>Please confirm your attendance by</p>
						<h5>
							{data.rsvpDeadline.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
							})}
						</h5>
					</div>
				{/if}
			{:else}
				<h2>Sorry, the deadline to confirm your attendance has passed.</h2>
				<p>
					If space permits, you may sign up as a walk-in at the doors the day of the event, but we
					cannot make any guarantees.
				</p>
			{/if}
		{:else if data.user.authUser.status === 'CONFIRMED'}
			<h2 class="status-message">
				Thanks for confirming your attendance!<br />Excited to see you :)
			</h2>
		{:else if data.user.authUser.status === 'DECLINED'}
			<h2 class="status-message">Sorry to see you go :(<br />Hope to see you next year!</h2>
		{/if}
		{#if data.user.authUser.status !== 'CREATED'}
			<div id="status-and-rsvp-sections">
				<div id="application-section">
					<h5>Application Status</h5>
					{#if data.user.authUser.status === 'ACCEPTED' || data.user.authUser.status === 'CONFIRMED' || data.user.authUser.status === 'DECLINED'}
						<h5 id="application-status" class="ACCEPTED">Accepted</h5>
					{:else}
						<h5 id="application-status" class={data.user.authUser.status}>
							{data.user.authUser.status}
						</h5>
						<h5>{data.user.authUser.roles}</h5>
					{/if}
				</div>
				{#if data.user.authUser.status === 'ACCEPTED' || data.user.authUser.status === 'CONFIRMED' || data.user.authUser.status === 'DECLINED'}
					<hr />
					<div id="rsvp-section">
						<h5>RSVP</h5>
						{#if data.user.authUser.status === 'ACCEPTED'}
							<select bind:value={rsvpSelectedValue}>
								<option value="" disabled selected hidden>Select one</option>
								<option value="confirm">Confirm</option>
								<option value="decline">Decline</option>
							</select>
						{:else}
							<h5 id="application-status" class={data.user.authUser.status}>
								{data.user.authUser.status}
							</h5>
						{/if}
					</div>
				{/if}
			</div>

			{#if data.user.authUser.status === 'ACCEPTED'}
				{#if data.rsvpDeadline === null || new Date() < data.rsvpDeadline}
					<form class="status-form" method="POST" use:enhance>
						{#if rsvpSelectedValue === 'confirm'}
							<button
								disabled={!rsvpSelectedValue}
								formaction="?/confirm"
								use:confirmationDialog={{
									text: 'Are you sure you want to CONFIRM your attendance?',
									cancel: 'No, go back',
									ok: 'Yes, I want to CONFIRM',
								}}>Submit</button
							>
						{:else if rsvpSelectedValue === 'decline'}
							<button
								disabled={!rsvpSelectedValue}
								formaction="?/decline"
								use:confirmationDialog={{
									text: 'Are you sure you want to DECLINE your attendance?',
									cancel: 'No, go back',
									ok: 'Yes, I want to DECLINE',
								}}>Submit</button
							>
						{:else}
							<button disabled={!rsvpSelectedValue}>Submit</button>
						{/if}
					</form>
				{/if}
			{:else if data.user.authUser.status === 'APPLIED'}
				<form class="status-form" method="POST" action="?/withdraw" use:enhance>
					{#if data.canApply}
						<button>Withdraw and Edit</button>
					{:else}
						<button disabled>Cannot edit because applications are closed.</button>
					{/if}
				</form>
			{/if}
		{/if}
	</div>

	<!-- The actual application -->
	{#if data.user.authUser.status === 'CREATED'}
		{#if data.canApply}
			<form
				bind:this={applicationForm}
				enctype="multipart/form-data"
				method="POST"
				action="?/save"
				use:enhance={({ action }) => {
					return async ({ update, result }) => {
						if (result.type === 'success') {
							if (result.data && Object.keys(result.data).length > 0) {
								toasts.notify('Please address the highlighted errors before submitting.');
							}
							update({ reset: false });
						}
					};
				}}
				oninput={() => {
					saveButton.disabled = true;
					saveButton.textContent = 'Autosaving...';
					if (debounceTimer !== undefined) {
						clearTimeout(debounceTimer);
					}
					debounceTimer = setTimeout(async () => {
						debounceTimer = undefined;

						const formData = new FormData(applicationForm);

						await fetch(applicationForm.action, {
							method: 'POST',
							body: formData,
						});
						9;
						saveButton.disabled = false;
						saveButton.textContent = 'Save and finish later';
					}, 1000);
				}}
				autocomplete="off"
			>
				<!-- Hidden input to send the role to the server -->
				<input
					type="hidden"
					name="group_applied"
					id="group_applied"
					value={selectedRole.toUpperCase()}
				/>

				<!-- Display the selected role -->
				{#if selectedRole}
					<p>You are applying as: <strong>{selectedRole}</strong></p>
				{/if}
				{#each data.questions as question}
					<!-- All the non target specific questions were being shown before user selected a role -->
					{#if selectedRole !== 'UNDECLARED' && (question.targetGroup?.includes(selectedRole) || question.targetGroup.length === 0)}
						<div class={'question ' + question.type.toLowerCase()}>
							<label for={question.id}>
								<SvelteMarkdown source={question.label} isInline />
								{#if question.required}*{/if}
								{#if form !== null && typeof form === 'object' && question.id in form}
									<span class="error">{form[question.id]}</span>
								{/if}
							</label>
							{#if question.type === 'SENTENCE'}
								<input
									type="text"
									name={question.id}
									id={question.id}
									bind:value={application[question.id]}
									placeholder={question.placeholder}
								/>
							{:else if question.type === 'PARAGRAPH'}
								<textarea
									name={question.id}
									id={question.id}
									bind:value={application[question.id]}
									placeholder={question.placeholder}
								></textarea>
							{:else if question.type === 'NUMBER'}
								<input
									type="number"
									name={question.id}
									id={question.id}
									step={question.step}
									bind:value={application[question.id]}
									placeholder={question.placeholder}
								/>
							{:else if question.type === 'CHECKBOX'}
								<input
									type="checkbox"
									name={question.id}
									id={question.id}
									bind:checked={application[question.id]}
								/>
							{:else if question.type === 'DROPDOWN'}
								<Dropdown
									name={question.id}
									items={question.options}
									custom={Boolean(question.custom)}
									multiple={Boolean(question.multiple)}
									bind:value={application[question.id]}
								/>
							{:else if question.type === 'RADIO'}
								{#each question.options as option}
									<div class="radio-buttons">
										<input
											type="radio"
											name={question.id}
											id={question.id + option}
											value={option}
											bind:group={application[question.id]}
										/>
										<label for={question.id + option}>{option}</label>
									</div>
								{/each}
							{:else if question.type === 'FILE'}
								<FileInput
									name={question.id}
									bind:selectedFile={application[question.id]}
									accept={question.accept}
									maxSizeMB={question.maxSizeMB}
								/>
							{/if}
						</div>
					{/if}
				{/each}

				<div id="actions-container">
					<div id="actions">
						<button class="negative-button" bind:this={saveButton}>Save and finish later</button>
						<button
							formaction="?/finish"
							onclick={() => {
								if (saveButton) {
									clearTimeout(debounceTimer);
									saveButton.disabled = false;
									saveButton.textContent = 'Save and finish later';
								}
							}}>Submit application</button
						>
					</div>
				</div>
			</form>
		{:else}
			<p>
				Sorry, applications have closed. If space permits, you may sign up as a walk-in at the doors
				the day of the event, but we cannot make any guarantees.
			</p>
		{/if}
	{/if}
</div>

<style>
	#rsvp {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
	}

	#status-and-rsvp-sections {
		border: 1px solid;
		border-radius: var(--border-radius);
		border-color: var(--light-grey);
		margin: 2rem 0;
	}

	.status-form {
		flex-direction: row;
		justify-content: end;
	}

	.status-form button {
		border-radius: var(--border-radius);
		display: inline-block;
		width: fit-content;
	}

	.ACCEPTED,
	.CONFIRMED {
		color: var(--accent);
	}

	.DECLINED {
		color: grey;
	}

	.APPLIED {
		color: var(--accent);
	}

	.rsvp-deadline > * {
		color: grey;
		margin: unset;
	}

	.rsvp-deadline h5 {
		color: red;
	}

	.status-message {
		margin: unset;
		margin-bottom: 1rem;
	}

	#status-and-rsvp-sections > * {
		margin: 0;
	}

	#status-and-rsvp-sections > * * {
		font-weight: 400;
		margin: 1em 1.25em;
	}

	#application-section {
		display: flex;
		justify-content: space-between;
	}

	#application-status {
		font-weight: bold;
		text-transform: lowercase;
	}

	#application-status::first-letter {
		text-transform: uppercase;
	}

	#rsvp-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	#rsvp-section select {
		margin: 0 1em;
		padding: 0.25em 0.5em;
		font-size: medium;
		min-width: 7em;
		color: black;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.question {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--accent); /* changed for dark mode */
	}

	.question label {
		color: var(--accent);
	}

	.checkbox {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: start;
		gap: 0;
	}

	input[type='checkbox'] {
		order: -1;
	}

	#status {
		padding: 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	#actions-container {
		position: sticky;
		bottom: 0;
		background: linear-gradient(transparent, var(--blue));
	}

	#actions {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5rem;
		position: sticky;
		padding-bottom: 1rem;
		background: var(--blue);
	}

	#actions > * {
		flex: 1;
	}

	.negative-button {
		background-color: var(--accent);
		color: var(--dark-blue);
	}

	/* #status button {
		width: 45%;
		margin-bottom: 1rem;
	} */

	.radio-buttons {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.error {
		height: 40px;
		background-color: var(--red);
		padding: 8px;
		border-radius: 10px;
		color: var(--white);
		margin: 0;
		order: 1;
	}

	bold {
		font-weight: bold;
	}

	.applyButtons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		width: 100%;
		flex-wrap: wrap;
	}

	.applyButtons button {
		min-width: 15rem;
		border: 1px solid var(--accent);
	}

	h5 {
		color: var(--accent); /* changed for dark mode */
	}
</style>
