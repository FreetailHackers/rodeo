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

{#if data.user?.role === 'ADMIN'}
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
	<SvelteMarkdown source={data.info} />
{/if}

<style>
	button {
		margin-top: 1rem;
	}
</style>
