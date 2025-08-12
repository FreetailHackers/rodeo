<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions';
	import Toggle from '$lib/components/toggle.svelte';
	import Graph from './line-graph.svelte';
	let { data } = $props();

	let applicationOpenStatus = $state(data.settings.applicationOpen);
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

<form method="POST" action="?/splitGroups" use:enhance>
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

<h2>QR Code Customization</h2>

<form method="POST" action="?/qrCodeSettings" use:enhance>
	<div class="qr-settings-container">
		<div class="qr-controls">
			<status-container>
				<label for="dotsColor">Dots Color</label>
				<input type="color" id="dotsColor" name="dotsColor" />
			</status-container>

			<status-container>
				<label for="backgroundColor">Background Color</label>
				<input type="color" id="backgroundColor" name="backgroundColor" value="#ffffff" />
			</status-container>

			<status-container>
				<label for="cornerSquareType">Corner Square Style</label>
				<select id="cornerSquareType" name="dotsType">
					<option value="square">Square</option>
					<option value="dot">Dot</option>
					<option value="extra-rounded">Extra Rounded</option>
				</select>
			</status-container>

			<status-container>
				<label for="imageUrl">Logo URL (optional)</label>
				<input
					type="url"
					id="imageUrl"
					name="imageUrl"
					placeholder="https://example.com/logo.png"
				/>
				<small
					>Leave empty to disable logo. Recommended size: square image, at least 100x100px</small
				>
			</status-container>

			<div class="qr-preview">
				<h3>Preview</h3>
				<div class="preview-container">
					<div class="qr-preview-code"></div>
				</div>
				<p><small>Preview shows sample data. Actual QR codes will contain user IDs.</small></p>
			</div>
			<button type="submit">Save QR Code Settings</button>
		</div>
	</div>
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
		background-color: #ff5555;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input,
	textarea {
		flex-grow: 1;
		width: 100%;
	}

	status-container {
		margin-top: 1rem;
	}
	select {
		width: 100%;
	}

	input[readonly] {
		background-color: rgb(182, 182, 182);
	}

	.qr-settings-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.qr-controls {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.qr-controls status-container {
		flex: 1;
		min-width: 12.5rem;
		padding: 1rem;
	}

	.qr-controls input[type='color'] {
		width: 7.5rem;
		height: 5rem;
		border: none;
		border-radius: var(--border-radius);
		cursor: pointer;
		padding: 0;
		margin: 0 auto;
		flex-grow: 0;
	}

	.qr-controls status-container:has(input[type='color']) {
		text-align: center;
	}

	.qr-controls status-container:has(input[type='color']) label {
		text-align: center;
		margin-bottom: 0.5rem;
	}

	.qr-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.preview-container {
		border: 2px solid var(--grey);
		border-radius: var(--border-radius);
		padding: 1rem;
		background-color: #f9f9f9;
		width: 12.5rem;
		height: 12.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.qr-preview-code {
		width: 100%;
		height: 100%;
	}
</style>
