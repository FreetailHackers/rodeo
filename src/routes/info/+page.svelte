<script lang="ts">
	import { enhance } from '$app/forms';
	// import MarkdownEditor from '$lib/components/markdown-editor.svelte';

	export let data;

	// const placeholder = `This text can be formatted with Markdown. Syntax examples:

	`# Heading 1

*italics* **bold** ***bold italic*** ~~strikethrough~~ \`inline code snippet\`

[I am a link!](https://example.com)
![Image alt text](https://example.com/image.png)
> Blockquote

1. Ordered list item 1
2. Ordered list item 2
- Unordered list item 1
- Unordered list item 2

\`\`\`
print('This is a multi-line code block.')
\`\`\`

| Table | Column 1 | Column 2 | Column 3 |
| ----- | -------- | -------- | -------- |
| Row 1 | Data 1   | Data 2   | Data 3   |
`;
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>
<!-- <img src="/black_background.jpeg" alt="black background" class="bg-img" /> -->
<div class="body">
	<div class="faq">
		<h2 class="left-border-faq">FAQ</h2>
		<h2 class="left-border-faq-2">FAQ</h2>
	</div>
	{#if data.user?.roles.includes('ADMIN')}
		<!-- <div class="faq_content">
			<form
				method="POST"
				use:enhance={() => {
					return async ({ update }) => {
						update({ reset: false });
					};
				}}
			>
				<MarkdownEditor name="info" {placeholder} rows={25} value={data.info} />
				<button type="submit">Save</button>
			</form>
		</div> -->
		<!-- <div class="faq-content"> -->
		<!-- <div class="faq_letters">
				<h2 class="left-border-faq">FAQ</h2>
				<h2 class="left-border-faq-2">FAQ</h2> -->
		<!-- </div> -->
		<div class="admin-panel">
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
		<!-- </div> -->
	{:else}
		<!-- <SvelteMarkdown source={data.info} /> -->
		<div class="faq_content" />
	{/if}
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

	/* button {
		margin-top: 1rem;
	} */

	.body {
		background-color: var(--background-color);
	}

	.faq {
		/* margin-top: 100px; */
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding-left: 0;
		/* background-color: var(--background-color); */
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		/* font-weight: 400; */
		font-size: 10rem;
		/* line-height: 240px; */
		color: #f2ebd9;
		transform: rotate(90deg);
		/* padding-left: 0; */
		/* transform-origin: top; */
	}

	.left-border-faq-2 {
		font-family: 'Zen Dots';
		font-style: normal;
		/* font-weight: 400;
		line-height: 240px;
		font-size: 10rem; */
		color: var(--background-color);
		-webkit-text-stroke: 1px #f2ebd9;
		transform: rotate(90deg);
		/* margin-left: 0; */
		/* transform-origin: top; */
	}

	.admin-panel {
		width: 50rem;
		display: block;
		margin-left: auto;
		margin-right: auto;
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
