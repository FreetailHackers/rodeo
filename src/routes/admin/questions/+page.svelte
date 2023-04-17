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
	{#each data.questions as question}
		<fieldset>
			<!-- Fields common to all question types -->
			<div class="metadata">
				<Toggle name={question.id + '_required'} label="Required" checked={question.required} />
				<button
					type="submit"
					name="id"
					value={question.id}
					formaction="?/delete"
					class="deleteButton">✕</button
				>
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
			{/if}
		</fieldset>
	{/each}

	<form method="POST" id="addQuestion" action="?/create" use:enhance>
		<button type="submit">Add Question</button>
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

	input {
		flex-grow: 1;
		width: 100%;
	}

	fieldset button {
		padding: 0 1rem;
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

	.metadata {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
</style>
