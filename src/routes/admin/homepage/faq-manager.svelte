<script lang="ts">
	import { enhance } from '$app/forms';
	import { Modal, Content, Trigger } from 'sv-popup';

	type FAQ = {
		id: number;
		question: string;
		answer: string;
	};

	export let faq: FAQ | null = null;

	let closeModal = false;

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		await fetch(form.action, {
			method: form.method,
			body: formData,
		});

		closeModal = true;
	}
</script>

<Modal basic bind:close={closeModal}>
	<Content>
		<h2>{faq ? 'Edit FAQ' : 'Create FAQ'}</h2>

		<form method="POST" action="?/handleFAQ" on:submit|preventDefault={handleSubmit} use:enhance>
			<input type="hidden" name="id" value={faq?.id || ''} />
			<label for="question">Question</label>
			<input
				type="text"
				id="question"
				name="question"
				required
				{...faq ? { value: faq.question } : {}}
			/>

			<label for="answer">Answer</label>
			<textarea id="answer" name="answer" required>{faq?.answer || ''}</textarea>

			<button type="submit">{faq ? 'Save Changes' : 'Create FAQ'}</button>
		</form>
	</Content>
	<Trigger>
		{#if faq}
			<p>Edit FAQ</p>
		{:else}
			<button>+ New</button>
		{/if}
	</Trigger>
</Modal>
