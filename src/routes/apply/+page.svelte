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
<div class="inside-main-content">
	<div class="race-car-status-div">
		<div class="race-car" />
		<div id="status" class={userStatus}>
			<div class="admission-top" />

			<h2>Application Status</h2>
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
					Unfortunately, we do not have the space to offer you admission at this time. We will
					contact you should this situation change.
				</p>
			{:else if data.user.authUser.status === 'ACCEPTED'}
				<h1>{data.user.authUser.status}</h1>

				{#if data.rsvpDeadline === null || new Date() < data.rsvpDeadline}
					{#if data.rsvpDeadline}
						<p>
							You must confirm your attendance by {data.rsvpDeadline.toLocaleDateString('en-US', {
								weekday: 'long',
								month: 'long',
								day: 'numeric',
								hour: 'numeric',
								minute: 'numeric',
							})} to secure your spot. If you know you will not be able to attend, please decline so
							we can offer your spot to someone else.
						</p>
					{/if}
					<form method="POST" id="rsvp" use:enhance>
						<button
							class="accept-btn"
							formaction="?/confirm"
							use:confirmationDialog={{
								text: 'Are you sure you want to confirm your attendance?',
								cancel: 'No, go back',
								ok: 'Yes, I want to confirm',
							}}>Confirm</button
						>

						<button
							class="decline-btn"
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
						Sorry, the deadline to confirm your attendance has passed. If space permits, you may
						sign up as a walk-in at the doors the day of the event, but we cannot make any
						guarantees.
					</p>
				{/if}
			{:else if data.user.authUser.status === 'CONFIRMED'}
				<h1>CONFIRMED</h1>
				<p>
					Glad you could make it! If you change your mind, please decline so we can offer your spot
					to someone else. We look forward to seeing you at the event!
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
				<p>
					We're sorry to hear that you will not be able to attend. We hope to see you next year!
				</p>
			{/if}
		</div>
	</div>

	<!-- The actual application -->
	{#if data.user.authUser.status === 'CREATED'}
		{#if data.canApply}
			<form
				bind:this={applicationForm}
				enctype="multipart/form-data"
				method="POST"
				action="?/save"
				class="form-apply-div"
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
	.inside-main-content {
		background-color: #1c1c1c;
		display: flex;
		margin-top: 0px;
		justify-content: center;
		position: relative;
		overflow: hidden;
		flex-direction: column;
	}

	.race-car-status-div {
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.form-apply-div {
		z-index: 2;
		padding: 5rem 2rem 2rem;
	}

	.form-apply-div label {
		color: white;
	}

	.admission-top {
		background-image: url(admission/admission-top.svg);
		width: 100%;
		height: 100px;
		position: absolute;
		left: -50px;
		top: -60px;
		background-repeat: no-repeat;
	}
	.race-car {
		background-image: url(admission/admission-car.svg);
		background-repeat: no-repeat;
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: 1;
		bottom: 0;
		background-size: contain;
		left: 0;
	}

	#rsvp {
		flex-direction: column;
		min-width: 50%;
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
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 60px 200px;
		flex-direction: column;
		z-index: 2;
		border-radius: 24px;
		position: relative;
		height: fit-content;
		margin: 0 auto;
		text-align: center;
		max-width: 600px;
	}

	#status h1 {
		font-family: 'Fugaz One';
	}

	.ACCEPTED {
		background: linear-gradient(180deg, rgba(92, 227, 177, 0.9) 66%, rgba(255, 255, 255, 0) 100%);
	}

	.ACCEPTED h1 {
		color: #008b58;
	}

	.REJECTED {
		background: linear-gradient(180deg, rgba(255, 69, 69, 0.9) 69%, rgba(255, 255, 255, 0) 100%);
	}

	.REJECTED h1 {
		color: #810606;
	}

	.WAITLISTED h1 {
		color: #fba834;
	}

	#status button:hover {
		transform: translateY(-2px);
	}

	#status .decline-btn {
		box-shadow: 0px 4px 4px 0px #00000040;
		background-color: transparent;
		border: 1px solid var(--primary-accent);
		color: var(--primary-accent);
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
		background-color: black;
	}

	#actions > * {
		flex: 1;
	}

	#status button {
		margin-bottom: 1rem;
		border-radius: 4px;
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
		#status {
			padding: 30px 60px 100px;
		}

		.race-car {
			width: 100%;
			height: 60%;
		}

		#status h2 {
			font-size: 15px;
		}

		#status h1 {
			font-size: 20px;
		}
	}
</style>
