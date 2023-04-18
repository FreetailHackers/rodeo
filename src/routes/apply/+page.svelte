<script lang="ts">
	import { enhance } from '$app/forms';
	import { Status } from '@prisma/client';
	import type { ActionData } from './$types';

	export let data;
	$: application = data.user.application as Record<string, unknown>;
	export let form: ActionData;

	let applicationForm: HTMLFormElement;
	let focusedQuestionId: string;

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let saveButton: HTMLButtonElement;
	let saveButtonText = typeof form === 'string' ? form : 'Save';

	let confirmAction = '';
	let dialog: HTMLDialogElement;
</script>

<!-- Application status dialog -->
<div id="status">
	<p>Your application status is:</p>
	{#if data.user.status === Status.CREATED}
		<h1>INCOMPLETE</h1>
		<p>You must complete your application to be considered for admission.</p>
	{:else if data.user.status === Status.APPLIED}
		<h1>SUBMITTED</h1>
		<p>Thanks for applying! The team will review your application soon.</p>
		<form method="POST" action="?/withdraw" use:enhance>
			{#if data.settings.applicationOpen}
				<button>Withdraw and Edit</button>
			{:else}
				<button disabled>Cannot edit because applications are closed.</button>
			{/if}
		</form>
	{:else if data.user.status === Status.REJECTED}
		<h1>REJECTED</h1>
		<p>Unfortunately, we do not have the space to offer you admission this year.</p>
	{:else if data.user.status === Status.WAITLISTED}
		<h1>WAITLISTED</h1>
		<p>
			Unfortunately, we do not have the space to offer you admission at this time. We will contact
			you should this situation change.
		</p>
	{:else if data.user.status === Status.ACCEPTED}
		<h1>{data.user.status}</h1>
		<p>
			Congratulations! We were impressed by your application and would like to invite you to attend.
		</p>
		{#if data.settings.confirmBy !== null}
			{#if new Date() < data.settings.confirmBy}
				<p>
					You must confirm your attendance by {data.settings.confirmBy.toLocaleDateString('en-US', {
						weekday: 'long',
						month: 'long',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
					})} to secure your spot. If you know you will not be able to attend, please decline so we can
					offer your spot to someone else.
				</p>
				<form method="POST" id="rsvp" use:enhance={({ cancel }) => cancel()}>
					<button
						formaction="?/decline"
						on:click={() => {
							confirmAction = 'decline';
							dialog.showModal();
						}}>Decline</button
					>
					<button
						formaction="?/confirm"
						on:click={() => {
							confirmAction = 'confirm';
							dialog.showModal();
						}}>Confirm</button
					>
					<dialog bind:this={dialog}>
						<p>
							Are you sure you want to {confirmAction} your attendance?
						</p>
						<form method="POST" use:enhance>
							<button type="button" on:click={() => dialog.close()}>Cancel</button>
							<button formaction={'?/' + confirmAction}>{confirmAction}</button>
						</form>
					</dialog>
				</form>
			{:else}
				<p>
					Sorry, the deadline to confirm your attendance has passed. If space permits, you may sign
					up as a walk-in at the doors the day of the event, but we cannot make any guarantees.
				</p>
			{/if}
		{/if}
	{:else if data.user.status === Status.CONFIRMED}
		<h1>CONFIRMED</h1>
		<p>
			Glad you could make it! If you change your mind, please decline so we can offer your spot to
			someone else. We look forward to seeing you at the event!
		</p>
		<form method="POST" use:enhance={({ cancel }) => cancel()} action="?/decline">
			<button
				on:click={() => {
					dialog.showModal();
				}}>Decline</button
			>
			<dialog bind:this={dialog}>
				<p>Are you sure you want to decline your attendance?</p>
				<form method="POST" use:enhance>
					<button type="button" on:click={() => dialog.close()}>Cancel</button>
					<button formaction="?/decline">Decline</button>
				</form>
			</dialog>
		</form>
	{:else if data.user.status === Status.DECLINED}
		<h1>DECLINED</h1>
		<p>We're sorry to hear that you will not be able to attend. We hope to see you next year!</p>
	{/if}
</div>

<!-- The actual application -->
{#if data.user.status === Status.CREATED}
	{#if data.settings.applicationOpen}
		<form
			bind:this={applicationForm}
			method="POST"
			action="?/save"
			use:enhance={() => {
				return async ({ update }) => {
					update({ reset: false });
				};
			}}
			on:input={() => {
				saveButton.disabled = true;
				saveButtonText = 'Autosaving...';
				if (debounceTimer !== undefined) {
					clearTimeout(debounceTimer);
				}
				debounceTimer = setTimeout(async () => {
					debounceTimer = undefined;
					applicationForm.requestSubmit();
					saveButton.disabled = false;
					saveButtonText = 'Save';
				}, 1000);
			}}
			autocomplete="off"
		>
			{#each data.questions as question}
				<label for={question.id}>
					{question.label}
					{#if question.required}*{/if}
				</label>
				<!-- svelte-ignore a11y-autofocus -->
				{#if question.type === 'SENTENCE'}
					<input
						type="text"
						name={question.id}
						id={question.id}
						bind:value={application[question.id]}
						placeholder={question.placeholder}
						autofocus={question.id === focusedQuestionId}
						on:focus={() => (focusedQuestionId = question.id)}
					/>
				{:else if question.type === 'PARAGRAPH'}
					<textarea
						name={question.id}
						id={question.id}
						bind:value={application[question.id]}
						placeholder={question.placeholder}
						autofocus={question.id === focusedQuestionId}
						on:focus={() => (focusedQuestionId = question.id)}
					/>
				{:else if question.type === 'NUMBER'}
					<input
						type="number"
						name={question.id}
						id={question.id}
						min={question.min}
						max={question.max}
						step={question.step}
						bind:value={application[question.id]}
						placeholder={question.placeholder}
						autofocus={question.id === focusedQuestionId}
						on:focus={() => (focusedQuestionId = question.id)}
					/>
				{/if}
			{/each}

			<button bind:this={saveButton}>{saveButtonText}</button>
			<button id="submit" formaction="?/finish">Submit Application</button>
		</form>

		<!-- Feedback -->
		{#if form !== null && typeof form === 'object'}
			<p>Please fix the following problems before submitting your application:</p>
			{#each Object.entries(form) as [key, value]}
				<p>
					<b class="error">{key}</b>
					{value}
				</p>
			{/each}
		{/if}
	{:else}
		<p>
			Sorry, applications have closed. If space permits, you may sign up as a walk-in at the doors
			the day of the event, but we cannot make any guarantees.
		</p>
	{/if}
{/if}

<style>
	#rsvp {
		flex-direction: row;
		justify-content: space-between;
		gap: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	#rsvp > * {
		flex-grow: 1;
	}

	input,
	textarea {
		margin-bottom: 1rem;
	}

	button {
		margin-bottom: 1rem;
	}

	#submit {
		margin: 0;
	}

	#status {
		border: 2px solid black;
		padding: 0 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}
</style>
