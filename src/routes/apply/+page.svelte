<script lang="ts">
	import { enhance } from '$app/forms';
	import SvelteMarkdown from 'svelte-markdown';
	import FileInput from '$lib/components/file-input.svelte';
	import { confirmationDialog } from '$lib/actions.js';
	import Dropdown from '$lib/components/dropdown.svelte';

	export let data;
	export let form;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const application = data.user.application as Record<string, any>;

	let applicationForm: HTMLFormElement;

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let saveButton: HTMLButtonElement;
</script>

<svelte:head>
	<title>Formula Hacks | Apply</title>
</svelte:head>

<!-- Application status dialog -->
<div class="main-content">
	<div id="status">
		<p>Your application status is:</p>
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
		{:else if data.user.authUser.status === 'APPLIED'}
			<h1>SUBMITTED</h1>
			<p>Thanks for applying! The team will review your application soon.</p>
			<form method="POST" action="?/withdraw" use:enhance>
				{#if data.canApply}
					<button>Withdraw and Edit</button>
				{:else}
					<button disabled>Cannot edit because applications are closed.</button>
				{/if}
			</form>
		{:else if data.user.authUser.status === 'REJECTED'}
			<h1>REJECTED</h1>
			<p>Unfortunately, we do not have the space to offer you admission this year.</p>
		{:else if data.user.authUser.status === 'WAITLISTED'}
			<h1>WAITLISTED</h1>
			<p>
				Unfortunately, we do not have the space to offer you admission at this time. We will contact
				you should this situation change.
			</p>
		{:else if data.user.authUser.status === 'ACCEPTED'}
			<h1>{data.user.authUser.status}</h1>
			<p>
				Congratulations! We were impressed by your application and would like to invite you to
				attend.
			</p>

			{#if data.rsvpDeadline === null || new Date() < data.rsvpDeadline}
				{#if data.rsvpDeadline}
					<p>
						You must confirm your attendance by {data.rsvpDeadline.toLocaleDateString('en-US', {
							weekday: 'long',
							month: 'long',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
						})} to secure your spot. If you know you will not be able to attend, please decline so we
						can offer your spot to someone else.
					</p>
				{/if}
				<form method="POST" id="rsvp" use:enhance>
					<button
						formaction="?/decline"
						use:confirmationDialog={{
							text: 'Are you sure you want to decline your attendance? This action cannot be undone!',
							cancel: 'No, go back',
							ok: 'Yes, I want to decline',
						}}>Decline</button
					>
					<button
						formaction="?/confirm"
						use:confirmationDialog={{
							text: 'Are you sure you want to confirm your attendance?',
							cancel: 'No, go back',
							ok: 'Yes, I want to confirm',
						}}>Confirm</button
					>
				</form>
			{:else}
				<p>
					Sorry, the deadline to confirm your attendance has passed. If space permits, you may sign
					up as a walk-in at the doors the day of the event, but we cannot make any guarantees.
				</p>
			{/if}
		{:else if data.user.authUser.status === 'CONFIRMED'}
			<h1>CONFIRMED</h1>
			<p>
				Glad you could make it! If you change your mind, please decline so we can offer your spot to
				someone else. We look forward to seeing you at the event!
			</p>
			<form method="POST" use:enhance action="?/decline">
				<button
					use:confirmationDialog={{
						text: 'Are you sure you want to decline your attendance? This action cannot be undone!',
						cancel: 'No, go back',
						ok: 'Yes, I want to decline',
					}}>Decline</button
				>
			</form>
		{:else if data.user.authUser.status === 'DECLINED'}
			<h1>DECLINED</h1>
			<p>We're sorry to hear that you will not be able to attend. We hope to see you next year!</p>
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
					return async ({ update }) => {
						if (action.search === '?/finish') {
							update({ reset: false });
						}
					};
				}}
				on:input={() => {
					saveButton.disabled = true;
					saveButton.textContent = 'Autosaving...';
					if (debounceTimer !== undefined) {
						clearTimeout(debounceTimer);
					}
					debounceTimer = setTimeout(async () => {
						debounceTimer = undefined;
						applicationForm.requestSubmit();
						saveButton.disabled = false;
						saveButton.textContent = 'Save and finish later';
					}, 1000);
				}}
				autocomplete="off"
			>
				{#each data.questions as question}
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
							/>
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
								on:input={() => applicationForm.dispatchEvent(new Event('input'))}
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
				{/each}

				<div id="actions-container">
					<div id="actions">
						<button bind:this={saveButton}>Save and finish later</button>
						<button
							formaction="?/finish"
							on:click={() => {
								clearTimeout(debounceTimer);
								saveButton.disabled = false;
								saveButton.textContent = 'Save and finish later';
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

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.question {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	#rsvp > * {
		flex-grow: 1;
	}

	#status {
		border: 2px solid black;
		padding: 0 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	#actions-container {
		position: sticky;
		bottom: 0;
		background: linear-gradient(transparent, white);
	}

	#actions {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		gap: 0.5rem;
		position: sticky;
		padding-bottom: 1rem;
		background: white;
	}

	#actions > * {
		flex: 1;
	}

	#status button {
		margin-bottom: 1rem;
	}

	.radio-buttons {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.error {
		color: red;
		margin: 0;
		order: 1;
	}

	bold {
		font-weight: bold;
	}
</style>
