<script lang="ts">
	import { enhance } from '$app/forms';
	import MarkdownEditor from '$lib/components/markdown-editor.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let data;

	const placeholder = `This text can be formatted with Markdown. Syntax examples:

# Heading 1

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

<div class="background">
	<!-- <img src="/black_background.jpeg" alt="black background" class="bg-img" /> -->
	{#if data.user?.roles.includes('ADMIN')}
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
	{:else}
		<!-- <SvelteMarkdown source={data.info} /> -->
		<div class="faq-body">
			<div class="side-faq">
				<h2 class="left-border-faq">FAQ</h2>
				<h2 class="left-border-faq-2">FAQ</h2>
			</div>
		</div>
	{/if}
	</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');



	.background {
		width: 100%;
		color: white;
		background-color: var(--background-color);
	}

	button {
		margin-top: 1rem;
	}

	/* FAQ */
	.faq-body {
		display: flex;
	}
	.side-faq {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.left-border-faq,
	.left-border-faq-2 {
		/* top: 4rem;
		left: -7rem; */
		/* position: absolute; */
		/* position: relative; */

		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-weight: 400;
		font-size: 10rem;
		/* line-height: 240px; */

		/* Beige */
		color: #f2ebd9;

		transform: rotate(90deg);
	}

	.left-border-faq-2 {
		/* FAQ */

		/* position: absolute; */

		font-family: 'Zen Dots';
		font-style: normal;
		font-weight: 400;
		font-size: 10rem;
		/* font-size: 200px; */
		/* line-height: 240px; */

		/* White */
		/* border: 1px solid #ffffff; */
		/* text-shadow:
    3px 3px 0 #f2ebd9,
    -3px 3px 0 #f2ebd9,
    -3px -3px 0 #f2ebd9,
    3px -3px 0 #f2ebd9; */
		color: var(--background-color);
		-webkit-text-stroke: 1px #f2ebd9;

		transform: rotate(90deg);
	}
</style>
