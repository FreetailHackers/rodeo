<script lang="ts">
	import { enhance } from '$app/forms';
	import { trpc } from '$lib/trpc/client';
	import { Status } from '@prisma/client';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const nullToUndefined = (object: object) => {
		return Object.fromEntries(
			Object.entries(object).map(([key, value]) => [key, value === null ? undefined : value])
		);
	};

	let { name, major } = data.user;
	$: user = { name, major };

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let saveButton: HTMLButtonElement;
	let saveButtonText = typeof form === 'string' ? form : 'Save';
</script>

<!-- Application status dialog -->
<div id="status">
	<p>Your application status is:</p>
	{#if data.user.status === Status.VERIFIED}
		<h1>INCOMPLETE</h1>
		<p>You must complete your application to be considered for admission.</p>
	{:else if data.user.status === Status.APPLIED}
		<h1>SUBMITTED</h1>
		<p>Thanks for applying! The team will review your application soon.</p>
		<form method="POST" action="?/withdraw" use:enhance>
			{#if data.applicationOpen}
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
	{:else}
		<h1>ACCEPTED</h1>
		<p>
			Congratulations! We were impressed by your application and would like to invite you to this
			year's hackathon.
		</p>
	{/if}
</div>

<!-- The actual application -->
{#if data.user.status === Status.VERIFIED}
	{#if data.applicationOpen}
		<form
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
					await trpc().setUser.mutate(nullToUndefined(user));
					saveButton.disabled = false;
					saveButtonText = 'Saved!';
				}, 1000);
			}}
			autocomplete="off"
		>
			<label for="name">Name </label>
			<input bind:value={name} type="name" name="name" placeholder="John Doe" required />
			<label for="major">Major</label>
			<input
				bind:value={major}
				type="major"
				name="major"
				placeholder="Underwater Basket Weaving"
				required
			/>
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
		<p>Sorry, applications have closed.</p>
	{/if}
{/if}

<style>
	button {
		margin-bottom: 1rem;
	}

	#submit {
		margin: 0;
	}

	.error {
		text-transform: uppercase;
	}

	#status {
		border: 1px solid black;
		padding: 0 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}
</style>
