<script lang="ts">
	import { enhance } from '$app/forms';
	// import MarkdownEditor from '$lib/components/markdown-editor.svelte';

	export let data;
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>

<div class="background">
	<div class="faq">
		<div class="show-large">
			<h2 class="left-border-faq">FAQ</h2>
			<h2 class="left-border-faq-2">FAQ</h2>
		</div>
		<div class="show-small">
			<h2 class="mobile-title">FAQ</h2>
		</div>
	</div>

	<div class="faq-view">
		<div class="faq-cards" />

		{#if data.user?.roles.includes('ADMIN')}
			<div class="faq-admin">
				<hr />
				<h2>Create New Question</h2>
				<form method="POST" use:enhance>
					<input type="hidden" name="id" />

					<label for="question">Question</label>
					<input type="text" id="question" name="question" required />

					<label for="answer">Answer</label>
					<textarea id="answer" name="answer" required />

					<button type="submit">Save</button>
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

	.show-large {
		display: none;
	}

	.show-small {
		display: contents;
	}

	@media (min-width: 1090px) {
		.show-large {
			display: contents;
		}

		.show-small {
			display: none;
		}
	}

	.background {
		background-color: var(--background-color);
		display: flex;
	}

	.faq {
		/* margin-top: 100px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		/* padding-left: 0; */
		/* background-color: var(--background-color); */
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-size: 8rem;
		color: #f2ebd9;
		transform: rotate(90deg);
	}

	.left-border-faq-2 {
		font-family: 'Zen Dots';
		font-style: normal;
		color: var(--background-color);
		-webkit-text-stroke: 1px #f2ebd9;
		transform: rotate(90deg);
	}

	.faq-admin {
		width: 50rem;
		display: block;
		margin-left: auto;
		margin-right: auto;
	}

	.mobile-title {
		margin-left: 2rem;
	}

	h2 {
		font-family: 'Fugaz One';
		color: #f2ebd9;
		text-align: left;
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		color: #f2ebd9;
		font-family: 'Geologica', sans-serif;
		margin-top: 10px;
	}

	input,
	textarea,
	button {
		background-color: var(--highlight-color);
		color: var(--background-color);
	}

	button {
		margin-bottom: 10px;
	}
</style>
