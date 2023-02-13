<script lang="ts">
	import { enhance } from '$app/forms';
	import Checkbox from '$lib/components/checkbox.svelte';
	import Dropdown from '$lib/components/dropdown.svelte';
	import Multiselect from '$lib/components/multiselect.svelte';
	import Radio from '$lib/components/radio.svelte';
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

	let {
		fullName,
		preferredName,
		gender,
		race,
		pronouns,
		photoReleaseAgreed,
		liabilityWaiverAgreed,
		codeOfConductAgreed,
		major,
		classification,
		graduation,
		firstGeneration,
		international,
		hackathonsAttended,
		workshops,
		referrer,
		excitedAbout,
		resume,
		github,
		linkedin,
		website,
		lunch,
		dietaryRestrictions,
		allergies,
		accommodations,
		other,
	} = data.user;
	$: user = {
		fullName,
		preferredName,
		gender,
		race,
		pronouns,
		photoReleaseAgreed,
		liabilityWaiverAgreed,
		codeOfConductAgreed,
		major,
		classification,
		graduation,
		firstGeneration,
		international,
		hackathonsAttended,
		workshops,
		referrer,
		excitedAbout,
		resume,
		github,
		linkedin,
		website,
		lunch,
		dietaryRestrictions,
		allergies,
		accommodations,
		other,
	};

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
			<p>Required fields are marked with an asterisk (*).</p>

			<label for="fullName">Full Name*</label>
			<input
				bind:value={fullName}
				type="text"
				id="fullName"
				name="fullName"
				placeholder="J. Random Hacker"
				required
			/>

			<label for="fullName">Preferred Name*</label>
			<input
				bind:value={preferredName}
				type="text"
				id="preferredName"
				name="preferredName"
				placeholder="John"
				required
			/>

			<Radio
				name="gender"
				choices={['Male', 'Female', 'Nonbinary', 'Other', 'Prefer not to say']}
				bind:value={gender}
				required
			/>

			<Multiselect
				bind:value={race}
				name="race"
				label="Race (hold CTRL/⌘ to select multiple)"
				options={[
					'American Indian or Alaskan Native',
					'Asian',
					'Black or African American',
					'Hispanic',
					'Native Hawaiian or Pacific Islander',
					'White',
					'Other',
				]}
				required
			/>

			<Radio
				name="pronouns"
				choices={['He/Him', 'She/Hers', 'They/Them', 'Other', 'Prefer not to say']}
				bind:value={pronouns}
				required
			/>

			<fieldset>
				<legend>Legal</legend>
				<p style="margin-top: 0">
					By clicking the checkboxes below, I agree to the following documents.
				</p>
				<Checkbox
					bind:checked={photoReleaseAgreed}
					name="photoReleaseAgreed"
					label="Photo Release"
					link="/forms/photo-release"
					required
				/>
				<Checkbox
					bind:checked={liabilityWaiverAgreed}
					name="liabilityWaiverAgreed"
					label="Liability Waiver"
					link="/forms/liability-waiver"
					required
				/>
				<Checkbox
					bind:checked={codeOfConductAgreed}
					name="codeOfConductAgreed"
					label="Code of Conduct"
					link="https://mlh.io/code-of-conduct"
					required
				/>
			</fieldset>

			<label for="major">Major*</label>
			<input
				bind:value={major}
				type="text"
				name="major"
				placeholder="Underwater Basket Weaving"
				required
			/>

			<Dropdown
				bind:value={classification}
				name="classification"
				label="Classification"
				options={['Freshman', 'Sophomore', 'Junior', 'Senior', 'Masters', 'Doctorate']}
				required
			/>

			<Dropdown
				bind:value={graduation}
				name="graduation"
				label="When will you be graduating?"
				options={[
					'Spring 2023',
					'Fall 2023',
					'Spring 2024',
					'Fall 2024',
					'Spring 2025',
					'Fall 2025',
					'Spring 2026',
					'Other',
				]}
				required
			/>

			<label for="hackathonsAttended">Hackathons Attended*</label>
			<input
				bind:value={hackathonsAttended}
				type="number"
				name="hackathonsAttended"
				placeholder="0"
				min="0"
				required
			/>

			<Multiselect
				bind:value={workshops}
				name="workshops"
				label="What workshops would you like to see? (hold CTRL/⌘ to select multiple)"
				options={[
					'Technical (frontend/backend)',
					'Networking/Resumes',
					'Ideation',
					'Pitching',
					'Sustainability',
				]}
			/>

			<Dropdown
				bind:value={referrer}
				name="referrer"
				label="How did you hear about us?"
				options={['Social Media', 'Tabling', 'Friends', 'Professor/Department', 'HackTX', 'Other']}
				required
			/>

			<label for="excitedAbout">What are you most excited about?*</label>
			<textarea
				bind:value={excitedAbout}
				name="excitedAbout"
				placeholder="I'm excited to..."
				required
			/>

			<fieldset id="sponsors">
				<legend>The following information will be shared with our sponsors.</legend>
				{#if form === 'tooBig'}<p class="error">Resumes can only be 1 MB.</p>{/if}
				<label for="resume"
					>Resume {#if resume !== null}(last uploaded: {resume?.split('/')[5]}){/if}</label
				>
				<input type="file" name="resume" accept=".pdf" />
				<label for="github">GitHub</label>
				<input
					bind:value={github}
					type="url"
					name="github"
					placeholder="https://github.com/DanielZTing"
				/>

				<label for="linkedin">LinkedIn</label>
				<input
					bind:value={linkedin}
					type="url"
					name="linkedin"
					placeholder="https://www.linkedin.com/in/danielzting"
				/>

				<label for="website">Website</label>
				<input
					bind:value={website}
					type="url"
					name="website"
					placeholder="https://danielzting.github.io"
				/>
			</fieldset>

			<div>
				<input type="checkbox" bind:checked={lunch} id="lunch" name="lunch" />
				<label for="lunch">
					Lunch may be provided to hackers contingent on availability. Check this box if you would
					like lunch provided to you.
				</label>
			</div>
			<br />

			<Multiselect
				bind:value={dietaryRestrictions}
				name="dietaryRestrictions"
				label="Dietary Restrictions (hold CTRL/⌘ to select multiple)"
				options={[
					'No pork',
					'Vegetarian',
					'Vegan',
					'No dairy',
					'No nuts',
					'No beef',
					'Gluten free',
				]}
			/>

			<label for="allergies"
				>If you have any other dietary restrictions or allergies not listed above, please describe
				them here.</label
			>
			<input bind:value={allergies} type="text" name="allergies" placeholder="Peanuts" />

			<label for="accomodations">Accomodations</label>
			<input
				bind:value={accommodations}
				name="accommodations"
				placeholder="I need a wheelchair accessible room."
			/>

			<label for="other">
				Anything else we should know? (If you answered "Other" to any question above, you may
				elaborate here.)
			</label>
			<input
				bind:value={other}
				type="text"
				name="other"
				placeholder="I love French food and have a balloon phobia!"
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
		border: 2px solid black;
		padding: 0 1rem;
		text-align: center;
		margin-bottom: 1rem;
	}

	#lunch {
		margin: 0;
		height: initial;
	}

	#sponsors {
		display: flex;
		flex-direction: column;
	}
</style>
