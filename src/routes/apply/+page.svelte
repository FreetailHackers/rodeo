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

	let userStatus = data.user.authUser.status;
</script>

<svelte:head>
	<title>Rodeo | Apply</title>
</svelte:head>
<!-- Application status dialog -->
<div class="main-content main-content-{userStatus}">
	{#if data.user.authUser.status === 'ACCEPTED' || data.user.authUser.status === 'REJECTED' || data.user.authUser.status === 'APPLIED' || data.user.authUser.status === 'CONFIRMED' || data.user.authUser.status === 'DECLINED' || data.user.authUser.status === 'WAITLISTED'}
		<img id="racecar" src="/admission/admission-car.svg" alt="racecar" />
	{/if}

	<div class="status status-{userStatus}">
		{#if data.user.authUser.status === 'ACCEPTED' || data.user.authUser.status === 'REJECTED' || data.user.authUser.status === 'APPLIED' || data.user.authUser.status === 'CONFIRMED' || data.user.authUser.status === 'DECLINED'}
			<div class="admission-top" />
			<h2>Application Status</h2>
		{/if}

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
		{:else if data.user.authUser.status === 'WAITLISTED'}
			<h1>WAITLISTED</h1>
			<p>
				Unfortunately, we do not have the space to offer you admission at this time. We will contact
				you should this situation change.
			</p>
		{:else if data.user.authUser.status === 'ACCEPTED'}
			<h1>APPROVED</h1>

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
						formaction="?/confirm"
						class="accept-btn"
						use:confirmationDialog={{
							text: 'Are you sure you want to confirm your attendance?',
							cancel: 'No, go back',
							ok: 'Yes, I want to confirm',
						}}>Confirm</button
					>

					<button
						formaction="?/decline"
						use:confirmationDialog={{
							text: 'Are you sure you want to decline your attendance? This action cannot be undone!',
							cancel: 'No, go back',
							ok: 'Yes, I want to decline',
						}}>Decline</button
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
	.main-content-ACCEPTED,
	.main-content-REJECTED,
	.main-content-APPLIED,
	.main-content-WAITLISTED,
	.main-content-CONFIRMED,
	.main-content-DECLINED {
		max-width: 100%;
		padding: 10rem 2rem 0;
		position: relative;
		margin: 0;
		background-color: #1c1c1c;
		height: calc(100vh - 159px);
	}

	#racecar {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 75vh;
	}

	.status {
		border: 2px solid black;
		padding: 0 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	.status h2,
	h1 {
		font-size: clamp(16px, 3vw, 24px);
	}

	.status button {
		margin-bottom: 1rem;
		padding: 0 10px;
		box-shadow: 0px 4px 4px 0px #00000040;
	}

	.status-ACCEPTED,
	.status-REJECTED,
	.status-APPLIED,
	.status-WAITLISTED,
	.status-CONFIRMED,
	.status-DECLINED {
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 60px 150px;
		flex-direction: column;
		z-index: 2;
		border-radius: 24px;
		position: relative;
		height: fit-content;
		margin: 0 auto;
		text-align: center;
		max-width: 600px;
		border: none;
	}

	.admission-top {
		background-image: url(/admission/admission-top.svg);
		width: 100%;
		height: 100px;
		position: absolute;
		left: -50px;
		top: -60px;
		background-repeat: no-repeat;
	}

	.status-ACCEPTED h2,
	.status-REJECTED h2 {
		margin-bottom: 50px;
	}

	.status-ACCEPTED h1,
	.status-REJECTED h1 {
		margin-bottom: 40px;
		font-family: 'Fugaz One';
	}
	.status-APPLIED,
	.status-WAITLISTED {
		background: linear-gradient(180deg, #5a6068 66%, rgba(255, 255, 255, 0) 100%);
	}

	.status-ACCEPTED,
	.status-CONFIRMED {
		background: linear-gradient(180deg, rgba(92, 227, 177, 0.9) 66%, rgba(255, 255, 255, 0) 100%);
	}

	.status-ACCEPTED h1,
	.status-CONFIRMED h1 {
		color: #008b58;
	}

	.status-REJECTED,
	.status-DECLINED {
		background: linear-gradient(180deg, rgba(255, 69, 69, 0.9) 69%, rgba(255, 255, 255, 0) 100%);
	}

	.status-REJECTED h1,
	.status-DECLINED h1 {
		color: #810606;
	}

	.status .accept-btn {
		box-shadow: 0px 4px 4px 0px #00000040;
		background-color: var(--highlight-color);
		/* border: 1px solid var(--primary-accent); */
		color: var(--primary-accent);
	}

	#rsvp {
		flex-direction: column;
		gap: 1rem;
		min-width: 75%;
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

	/* Styles for viewport widths up to 768 pixels (typical for mobile devices) */
	@media screen and (max-width: 768px) {
		.main-content-ACCEPTED,
		.main-content-REJECTED,
		.main-content-APPLIED,
		.main-content-WAITLISTED,
		.main-content-CONFIRMED,
		.main-content-DECLINED {
			height: calc(100vh - 56px);
		}

		.admission-top {
			left: -80px;
			top: -70px;
		}
	}
</style>
