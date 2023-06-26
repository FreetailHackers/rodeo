<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';

	export let data;
</script>

<h1>Registration Questions</h1>

<form
	action="?/update"
	method="POST"
	use:enhance={() =>
		async ({ update }) => {
			update({ reset: false });
		}}
>
	<!-- NOTE: see corresponding +page.server.ts to see how form data is structured and parsed -->
	{#each data.questions as question (question.id)}
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
						name="order"
						value={question.order - 1}
						formaction="?/swap"
						disabled={question.order === 0}>↑</button
					>
					<button
						type="submit"
						name="order"
						value={question.order}
						formaction="?/swap"
						disabled={question.order === data.questions.length - 1}>↓</button
					>
					<button
						type="submit"
						name="id"
						value={question.id}
						formaction="?/delete"
						class="deleteButton">✕</button
					>
				</div>
			</div>
			<div>
				<label for={question.id}><b>{question.type}</b> Label</label>
				<input
					value={question.label}
					name={question.id + '_label'}
					id={question.id}
					placeholder="What is your name?"
				/>
			</div>
			<!-- Question-type-specific fields -->
			{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
				<div>
					<label for={question.id}>Placeholder</label>
					<input
						value={question.placeholder}
						name={question.id + '_placeholder'}
						id={question.id + '_placeholder'}
						placeholder="J. Random Hacker"
					/>
				</div>
				<div>
					<label for={question.id}>Response must match regex:</label>
					<input
						value={question.regex}
						name={question.id + '_regex'}
						id={question.id + '_regex'}
						placeholder="Leave empty to accept all"
					/>
				</div>
			{:else if question.type === 'NUMBER'}
				<div>
					<label for={question.id}>Placeholder</label>
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
						<label for={question.id}>Minimum</label>
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
						<label for={question.id}>Maximum</label>
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
						<label for={question.id}>Step</label>
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
			{:else if question.type === 'DROPDOWN'}
				<div>
					<label for={question.id}>Options</label>
					<textarea
						value={question.options.join('\n')}
						name={question.id + '_options'}
						id={question.id + '_options'}
						placeholder="Write one option per line, like this:&#13;OPTION 1&#13;OPTION 2&#13;OPTION 3"
						on:input={() => {
							// Auto resize textarea to fit content
							const textarea = document.getElementById(question.id + '_options');
							// Height should be at least 4 lines for placeholder text, plus 2 lines of padding
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore (can't type this because Svelte doesn't support TS in HTML)
							textarea.style.height = Math.max(4, textarea.value.split('\n').length) + 2 + 'lh';
						}}
						style="height: {Math.max(4, question.options.length) + 2}lh"
					/>
				</div>
			{/if}
		</fieldset>
	{/each}

	<form method="POST" id="addQuestion" action="?/create" use:enhance>
		<select name="type" form="addQuestion">
			<option value="SENTENCE">Sentence</option>
			<option value="PARAGRAPH">Paragraph</option>
			<option value="NUMBER">Number</option>
			<option value="DROPDOWN">Dropdown</option>
			<option value="MULTISELECT">Multiselect</option>
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
		flex-direction: row;
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
</style>
