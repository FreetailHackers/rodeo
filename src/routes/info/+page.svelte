<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role } from '@prisma/client';
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

{#if data.user?.role === Role.ADMIN}
	<form
		method="POST"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<textarea id="info" name="info" {placeholder} rows="100">{data.info}</textarea>
		<button type="submit">Save</button>
	</form>
{/if}
<SvelteMarkdown source={data.info} />

<style>
	textarea {
		height: 32rem;
	}
</style>
