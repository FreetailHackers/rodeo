<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions';
	import Toggle from '$lib/components/toggle.svelte';
	import { toasts } from '$lib/stores';
	import Graph from './line-graph.svelte';
	let { data } = $props();

	let applicationOpenStatus = $state(data.settings.applicationOpen);

	let selectedGroupId = $state(data.groups.length > 0 ? data.groups[0].id : '');

	// Reactive values for colors based on selected group
	let dotsColor = $derived(() => {
		console.log('inside dotsColor');
		const group = data.groups.find((g) => g.id === selectedGroupId);
		console.log(group?.qrCodeStyle?.dotsOptions?.color);
		return group?.qrCodeStyle?.dotsOptions?.color || '#000000';
	});

	let backgroundColor = $derived(() => {
		const group = data.groups.find((g) => g.id === selectedGroupId);
		return group?.qrCodeStyle?.backgroundOptions?.color || '#ffffff';
	});

	let dotsType = $derived(() => {
		const group = data.groups.find((g) => g.id === selectedGroupId);
		return group?.qrCodeStyle?.dotsOptions?.type || 'rounded';
	});

	let backgroundImage = $derived(() => {
		const group = data.groups.find((g) => g.id === selectedGroupId);
		return group?.qrCodeStyle?.imageKey || null;
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			if (input.files[0].size > 1024 * 1024) {
				toasts.notify('Error: File size must be under 1MB.');
			}
		}
	}
</script>

<svelte:head>
	<title>Rodeo | Admin - Admissions</title>
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
	<label for="applicationStatus"><h2>Application Status</h2></label>

	<div class="flex-row">
		<Toggle
			name="applicationOpen"
			label="Accept new applications"
			bind:checked={applicationOpenStatus}
			isLeft={true}
		/>
	</div>

	<status-container>
		<label for="hackathonStartDate">Hackathon Start Date:</label>
		<input
			type="datetime-local"
			name="hackathonStartDate"
			id="hackathonStartDate"
			value={data.settings.hackathonStartDate
				?.toLocaleString('sv', { timeZone: data.settings.timezone })
				.replace(' ', 'T')
				.slice(0, -3)}
		/>
	</status-container>

	<status-container>
		<label for="applicationDeadline">Application will close on</label>
		<input
			readonly={!applicationOpenStatus}
			type="datetime-local"
			name="applicationDeadline"
			id="applicationDeadline"
			value={data.settings.applicationDeadline
				?.toLocaleString('sv', { timeZone: data.settings.timezone })
				.replace(' ', 'T')
				.slice(0, -3)}
		/>
	</status-container>

	<status-container>
		<label for="applicationLimit"
			>Applications close when the total number of APPLIED, ACCEPTED, or CONFIRMED accounts reaches
			this limit</label
		>
		<input
			readonly={!applicationOpenStatus}
			type="number"
			name="applicationLimit"
			id="applicationLimit"
			value={data.settings.applicationLimit}
			placeholder="Leave empty to disable"
			min="0"
		/>
	</status-container>

	<label for="statusChangeText"><h2>User Status Over Time</h2></label>
	<Graph statusChanges={data.graph} />

	<status-container>
		<label for="daysToRSVP"> Hackers must RSVP within this many days after acceptance </label>
		<input
			type="number"
			id="daysToRSVP"
			name="daysToRSVP"
			placeholder="Leave empty to disable"
			min="0"
			value={data.settings.daysToRSVP}
		/>
	</status-container>

	<status-container>
		<label for="timezone">Timezone</label>
		<select name="timezone" id="timezone" value={data.settings.timezone}>
			{#each Intl.supportedValuesOf('timeZone') as timezone}
				<option value={timezone}>{timezone}</option>
			{/each}
		</select>
	</status-container>

	<label for="scanActions"><h2>Scan Options</h2></label>
	<textarea
		value={data.settings.scanActions.join('\n')}
		name="scanActions"
		id="scanActions"
		placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
	></textarea>

	<button type="submit">Save</button>
</form>

<h2>Split Hackers Into Lunch Groups</h2>

<form
	method="POST"
	action="?/splitGroups"
	use:enhance={() => {
		return async ({ result, update }) => {
			// Always update the page data to refresh the derived values
			await update();

			// Optionally show a success message
			if (result.type === 'success') {
				toasts.notify('QR Code settings updated successfully!');
			}
		};
	}}
>
	<input
		type="text"
		id="splitGroups"
		name="splitGroups"
		placeholder="Group A, Group B, Group C, ..."
		pattern="^[A-Za-z0-9\s]+(,\s*[A-Za-z0-9\s]+)*$"
		title="Names must be alphanumeric in the form: 'Group 1', 'Group 2', 'Group 3', ..."
		required
	/>
	<button type="submit">Split Groups</button>
</form>

<h2>Customize QR Codes</h2>

<form
	method="POST"
	action="?/qrCodeSettings"
	class="qr-form"
	enctype="multipart/form-data"
	use:enhance={() => {
		return async ({ update }) => {
			await update({ reset: false });
		};
	}}
>
	<h3>QR Code Styling</h3>

	{#if data.groups.length >= 1}
		<div class="flex-row-left">
			<select id="group" name="group" class="group-dropdown" bind:value={selectedGroupId}>
				{#each data.groups as group}
					<option value={group.id}>{group.id}</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="qr-grid">
		<div class="qr-field">
			{#if backgroundImage() == null}
				<label for="qr-image">QR Code Image (leave empty for no image)</label>
			{:else}
				<label for="qr-image">Replace QR Code Image (leave empty for keep current image)</label>
			{/if}
			<input
				type="file"
				id="qr-image"
				name="qr-image"
				accept=".jpg, .jpeg, .png, .webp"
				onchange={handleFileChange}
			/>
		</div>

		<div class="qr-field">
			<label for="dotsType">Dots Style</label>
			<select id="dotsType" name="dotsType" value={dotsType()}>
				<option value="rounded">Rounded</option>
				<option value="dots">Dots</option>
				<option value="classy">Classy</option>
				<option value="classy-rounded">Classy Rounded</option>
				<option value="square">Square</option>
				<option value="extra-rounded">Extra Rounded</option>
			</select>
		</div>

		<div class="qr-field">
			<label for="dotsColor">Dots Color</label>
			<input type="color" id="dotsColor" name="dotsColor" value={dotsColor()} />
		</div>

		<div class="qr-field">
			<label for="backgroundColor">Background Color</label>
			<input type="color" id="backgroundColor" name="backgroundColor" value={backgroundColor()} />
		</div>
	</div>

	<button type="submit"> Update QR Code Style </button>
</form>

<h2>Pending Decisions</h2>
<form method="POST" action="?/release" use:enhance>
	<button
		id="release"
		use:confirmationDialog={{
			text: 'Are you sure you want to release all pending decisions?',
			cancel: 'Cancel',
			ok: 'OK',
		}}
		>Release all {Object.values(data.decisions).reduce((sum, array) => sum + array.length, 0)} pending
		decisions</button
	>
</form>

<style>
	form {
		padding-top: 10px;
	}

	.flex-row {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1em;
	}

	.flex-row-left {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 1em;
	}

	button {
		margin-top: 30px;
		width: 100%;
		margin-bottom: 1rem;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		margin-bottom: 1rem;
		text-transform: uppercase;
		background-color: var(--red);
		height: auto;
		min-height: 3rem;
	}

	#release:hover {
		color: white;
		background-color: var(--red);
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: var(--accent); /* changed for dark mode */
	}

	input,
	textarea {
		flex-grow: 1;
		width: 100%;
	}

	status-container {
		margin-top: 1rem;
	}
	.qr-form {
		margin: 20px 0;
		padding: 20px;
		border: 1px solid #e5e5e5;
		border-radius: 6px;
	}

	.qr-form h3 {
		margin: 0 0 16px 0;
		font-size: 18px;
		font-weight: 600;
	}

	.qr-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		margin-bottom: 16px;
	}

	.qr-field label {
		display: block;
		font-size: 14px;
		font-weight: 500;
		margin-bottom: 4px;
	}

	.qr-field input,
	.qr-field select {
		width: 100%;
		padding: 8px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
	}

	.qr-field input[type='color'] {
		height: 40px;
		cursor: pointer;
		max-width: 25%;
	}

	@media (max-width: 768px) {
		.qr-grid {
			grid-template-columns: 1fr;
		}
	}

	select {
		width: 100%;
	}

	.group-dropdown {
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 14px;
		padding: 8px 12px;
		background-color: white;
		cursor: pointer;
		width: 25%;
		font-weight: bold;
		color: black;
	}

	input[readonly] {
		background-color: var(--light-grey);
	}
</style>
