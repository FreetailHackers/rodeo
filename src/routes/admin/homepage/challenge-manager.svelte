<script lang="ts">
	import { enhance } from '$app/forms';
	// @ts-expect-error: The 'sv-popup' module does not have type definitions, so we are temporarily using 'any' type.
	import { Modal, Content, Trigger } from 'sv-popup';

	type Challenge = {
		id: number;
		title: string;
		prize: string | null;
		description: string;
	};

	export let challenge: Challenge | null = null;

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
		<h2>{challenge ? 'Edit Challenge' : 'Create Challenge'}</h2>

		<form
			method="POST"
			action="?/handleChallenge"
			on:submit|preventDefault={handleSubmit}
			use:enhance
		>
			<input type="hidden" name="id" value={challenge?.id || ''} />

			<label for="title">Title</label>
			<input
				type="text"
				id="title"
				name="title"
				required
				{...challenge ? { value: challenge.title } : {}}
			/>

			<label for="prize">Prize (optional)</label>
			<input
				type="text"
				id="prize"
				name="prize"
				{...challenge && challenge.prize ? { value: challenge.prize } : {}}
			/>

			<label for="description">Description</label>
			<textarea id="description" name="description" required
				>{challenge?.description || ''}</textarea
			>

			<button type="submit">{challenge ? 'Save Changes' : 'Create Challenge'}</button>
		</form>
	</Content>
	<Trigger>
		{#if challenge}
			<p>Edit Challenge</p>
		{:else}
			<button>+ New</button>
		{/if}
	</Trigger>
</Modal>
