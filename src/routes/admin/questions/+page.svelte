<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import Toggle from '$lib/components/toggle.svelte';

	export let data;
</script>

<svelte:head>
	<title>Formula Hacks | Admin - Registration Questions</title>
</svelte:head>

<form
	action="?/update"
	method="POST"
	use:enhance={() =>
		async ({ update }) => {
			update({ reset: false });
		}}
>
	<!-- NOTE: see corresponding +page.server.ts to see how form data is structured and parsed -->
	{#each data.questions as question, i (question.id)}
		<fieldset>
			<input type="hidden" name={question.id + '_type'} value={question.type} />
			<!-- Fields common to all question types -->
			<div class="flex-row">
				<Toggle name={question.id + '_required'} label="Required" checked={question.required} />
				<!-- Put a hidden disabled button before the these
					 buttons to prevent enter from triggering them -->
				<div class="flex-row actions">
					<button type="submit" disabled style="display: none" aria-hidden="true" />
					<button
						type="submit"
						name="id"
						value={question.id}
						formaction="?/moveUp"
						disabled={i === 0}>↑</button
					>
					<button
						type="submit"
						name="id"
						value={question.id}
						formaction="?/moveDown"
						disabled={i === data.questions.length - 1}>↓</button
					>
					<button
						type="submit"
						name="id"
						value={question.id}
						formaction="?/delete"
						use:confirmationDialog={{
							text: 'Are you sure you want to delete this question and all responses to it? This cannot be undone!',
							cancel: 'Cancel',
							ok: 'Delete',
						}}>✕</button
					>
				</div>
			</div>
			<div>
				<label for={question.id + '_label'}><b>{question.type}</b> Label</label>
				<input
					value={question.label}
					name={question.id + '_label'}
					id={question.id + '_label'}
					placeholder="What is your name?"
				/>
			</div>
			<!-- Question-type-specific fields -->
			{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
				<div>
					<label for={question.id + '_placeholder'}>Placeholder</label>
					<input
						value={question.placeholder}
						name={question.id + '_placeholder'}
						id={question.id + '_placeholder'}
						placeholder="J. Random Hacker"
					/>
				</div>
				<div>
					<label for={question.id + '_regex'}>Response must match regex:</label>
					<input
						value={question.regex}
						name={question.id + '_regex'}
						id={question.id + '_regex'}
						placeholder="Leave empty to accept all"
					/>
				</div>
			{:else if question.type === 'NUMBER'}
				<div>
					<label for={question.id + '_placeholder'}>Placeholder</label>
					<input
						value={question.placeholder}
						type="number"
						name={question.id + '_placeholder'}
						id={question.id + '_placeholder'}
						placeholder="J. Random Hacker"
					/>
				</div>
				<div class="flex-row">
					<div>
						<label for={question.id + '_min'}>Minimum</label>
						<input
							value={question.min}
							type="number"
							name={question.id + '_min'}
							id={question.id + '_min'}
							placeholder="0"
							step="any"
						/>
					</div>
					<div>
						<label for={question.id + '_max'}>Maximum</label>
						<input
							value={question.max}
							type="number"
							name={question.id + '_max'}
							id={question.id + '_max'}
							placeholder="100"
							step="any"
						/>
					</div>
					<div>
						<label for={question.id + '_step'}>Step</label>
						<input
							value={question.step}
							type="number"
							name={question.id + '_step'}
							id={question.id + '_step'}
							placeholder="1"
							step="any"
						/>
					</div>
				</div>
			{:else if question.type === 'DROPDOWN' || question.type === 'RADIO'}
				<div>
					<label for={question.id + '_options'}>Options</label>
					<textarea
						value={question.options.join('\n')}
						name={question.id + '_options'}
						id={question.id + '_options'}
						placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
					/>
				</div>
				<div class="flex-row">
					<Toggle
						name={question.id + '_multiple'}
						label="Allow multiple selections"
						checked={Boolean(question.multiple)}
					/>
					<Toggle
						name={question.id + '_custom'}
						label="Allow custom response entry"
						checked={Boolean(question.custom)}
					/>
				</div>
			{:else if question.type === 'FILE'}
				<div class="flex-row">
					<div>
						<label for={question.id + '_accept'}>Accepted types:</label>
						<input
							value={question.accept}
							name={question.id + '_accept'}
							id={question.id + '_accept'}
							placeholder=".doc, .docx, .pdf"
						/>
					</div>
					<div>
						<label for={question.id + '_maxSizeMB'}>Max file size (MB)</label>
						<input
							value={question.maxSizeMB}
							type="number"
							name={question.id + '_maxSizeMB'}
							id={question.id + '_maxSizeMB'}
							placeholder="10"
							step="any"
						/>
					</div>
				</div>
			{/if}
			<div class="flex-row">
				<Toggle
					name={question.id + '_hideAdmission'}
					label="Hide Question From Admission"
					checked={question.hideAdmission}
				/>
				<Toggle
					name={question.id + '_hideScan'}
					label="Hide Question From Scan Page"
					checked={question.hideScan}
				/>
			</div>
			<Toggle
				name={question.id + '_sponsorView'}
				label="Viewable by Sponsors"
				checked={question.sponsorView}
			/>
		</fieldset>
	{/each}

	<form method="POST" id="addQuestion" action="?/create" use:enhance>
		<select name="type" form="addQuestion">
			<option value="SENTENCE">Sentence</option>
			<option value="PARAGRAPH">Paragraph</option>
			<option value="NUMBER">Number</option>
			<option value="DROPDOWN">Dropdown</option>
			<option value="CHECKBOX">Checkbox</option>
			<option value="RADIO">Radio</option>
			<option value="FILE">File</option>
		</select>
		<button type="submit">Add Question</button>
	</form>
	<button type="submit">Save</button>
</form>

<style>
	fieldset {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1rem;
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

	fieldset button {
		width: 2.5rem;
	}

	#addQuestion {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	#addQuestion select {
		flex-grow: 1;
	}

	#addQuestion button {
		padding: 0 1rem;
	}

	.flex-row {
		display: flex;
		flex-flow: row wrap;
		justify-content: space-between;
		gap: 1rem;
	}

	.flex-row > div {
		flex-grow: 1;
	}

	.actions {
		justify-content: end;
		gap: 0.5rem;
	}

	button {
		margin-bottom: 1rem;
	}
</style>
