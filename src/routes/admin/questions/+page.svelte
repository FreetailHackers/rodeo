<script lang="ts">
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions.js';
	import Toggle from '$lib/components/toggle.svelte';
	import { QuestionType } from '@prisma/client';

	let questionTypes: string[] = [];
	Object.entries(QuestionType).forEach((keyValue) => {
		if (keyValue[1]) {
			questionTypes.push(keyValue[1]);
		}
	});
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Admin - Registration Questions</title>
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
			<div class="flex-row">
				<div>
					<label for={question.id + '_label'}>Question</label>
					<input
						value={question.label}
						name={question.id + '_label'}
						id={question.id + '_label'}
						placeholder="What is your name?"
					/>
				</div>
				<div>
					<label for={question.id + '_label'}>Question Type</label>
					<select
						bind:value={question.type}
						name={question.id + '_label'}
						id={question.id + '_label'}
						placeholder="What is your name?"
					>
						{#each questionTypes as type}
							<option>{type}</option>
						{/each}
					</select>
				</div>
			</div>
			{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
				<div class="flex-row">
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
				<div>
					<label for={question.id + '_regex'}>Response must match regex:</label>
					<input
						value={question.regex}
						name={question.id + '_regex'}
						id={question.id + '_regex'}
						placeholder="Leave empty to accept all"
					/>
				</div>
				<div class="flex-row">
					<span>
						<label for={question.id + '_min'}>Minimum</label>
						<input
							value={question.min}
							type="number"
							name={question.id + '_min'}
							id={question.id + '_min'}
							placeholder="0"
							step="any"
						/>
					</span>
					<span>
						<label for={question.id + '_max'}>Maximum</label>
						<input
							value={question.max}
							type="number"
							name={question.id + '_max'}
							id={question.id + '_max'}
							placeholder="100"
							step="any"
						/>
					</span>
					<span>
						<label for={question.id + '_step'}>Step</label>
						<input
							value={question.step}
							type="number"
							name={question.id + '_step'}
							id={question.id + '_step'}
							placeholder="1"
							step="any"
						/>
					</span>
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
			<div class="flex-row checkboxes">
				<span>
					<label>
						<input
							type="checkbox"
							name={question.id + '_hideAdmission'}
							checked={question.hideAdmission}
						/>Hide Question From Admission</label
					>
				</span>
				<span>
					<label>
						<input
							type="checkbox"
							name={question.id + '_hideScan'}
							checked={question.hideScan}
						/>Hide Question From Scan Page
					</label>
				</span>
				<span>
					<label>
						<input
							type="checkbox"
							name={question.id + '_sponsorView'}
							checked={question.sponsorView}
						/>
						Viewable by Sponsors
					</label>
				</span>
			</div>
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

		background: var(--background-grey);
		border-radius: var(--border-radius);
		border: none;
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

	input[type='checkbox'] {
		flex-grow: 0;
		width: unset;
		margin: 0;
	}

	fieldset button {
		padding: 0.25em 0.5em;
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
		flex-basis: 40%;
	}

	.flex-row > div > select {
		width: 100%;
		color: var(--black);
	}

	.flex-row:has(> span) {
		flex-wrap: nowrap;
	}

	.checkboxes {
		font-size: var(--font-size-xs);
	}

	.actions {
		justify-content: end;
		gap: 0.5rem;
	}

	button {
		margin-bottom: 1rem;
	}
</style>
