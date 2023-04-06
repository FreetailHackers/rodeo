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
				<select name={question.id + '_type'} value={question.type}>
					<option value="SENTENCE">Sentence</option>
					<option value="PARAGRAPH">Paragraph</option>
					<option value="NUMBER">Number</option>
					<option value="DROPDOWN">Dropdown</option>
					<option value="MULTISELECT">Multiselect</option>
					<option value="CHECKBOXES">Checkboxes</option>
					<option value="RADIO">Radio</option>
					<option value="FILE">File</option>
				</select>
				<button
					type="submit"
					name="id"
					value={question.id}
					formaction="?/delete"
					class="deleteButton">✕</button
				>
			</div>
			<Toggle name={question.id + '_required'} label="Required" checked={question.required} />
			<label for={question.id}>Question Label</label>
			<input
				value={question.label}
				name={question.id + '_label'}
				id={question.id}
				placeholder="What is your name?"
			/>
			<!-- Question-type-specific fields -->
			{#if question.type === 'SENTENCE' || question.type === 'PARAGRAPH'}
				<label for={question.id}>Placeholder</label>
				<input
					value={question.placeholder}
					name={question.id + '_placeholder'}
					id={question.id}
					placeholder="J. Random Hacker"
				/>
			{/if}
		</fieldset>
	{/each}
	<button type="submit" formaction="?/create" id="addQuestion">Add Question</button>
	<button type="submit">Save</button>
</form>

<style>
	fieldset {
		display: flex;
		flex-direction: column;
		padding: 1rem;
	}

	input {
		flex-grow: 1;
		width: 100%;
	}

	fieldset button {
		margin-left: 0.5rem;
		padding: 0 1rem;
	}

	#addQuestion {
		margin-bottom: 1rem;
	}

	.metadata {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.metadata select {
		flex-grow: 1;
	}
</style>
