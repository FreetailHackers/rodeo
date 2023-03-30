<script lang="ts">
	import { enhance } from '$app/forms';

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
	{#each data.questions as question}
		{#if question.type === 'SENTENCE'}
			<fieldset>
				<input value={question.label} name={question.id} />
				<button type="submit" name="id" value={question.id} formaction="?/delete">Delete</button>
			</fieldset>
		{/if}
	{/each}
	<button type="submit" formaction="?/create" id="addQuestion">Add Question</button>
	<button type="submit">Save</button>
</form>

<style>
	fieldset {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 1rem;
	}

	input {
		margin: 0;
		flex-grow: 1;
	}

	fieldset button {
		margin-left: 0.5rem;
		padding: 0 1rem;
	}

	#addQuestion {
		margin-bottom: 1rem;
	}
</style>
