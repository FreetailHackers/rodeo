<script lang="ts">
	import type { FAQ } from '@prisma/client';
	import Accordion from './accordion.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let faqs: FAQ[];

	const splitQuestions = (faqs: FAQ[]) => {
		const middleIndex = Math.ceil(faqs.length / 2);
		return [faqs.slice(0, middleIndex), faqs.slice(middleIndex)];
	};

	const [columnOne, columnTwo] = splitQuestions(faqs);
</script>

<div class="home-content">
	<h2>Any Questions?</h2>
	<div class="questions">
		{#each [columnOne, columnTwo] as column}
			<div class="questions-col">
				{#each column as faq}
					<Accordion>
						<span slot="head" class="question-title">{faq.question}</span>
						<div slot="details" class="question-answer">
							<SvelteMarkdown source={faq.answer} />
						</div>
					</Accordion>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.questions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1em;
		cursor: default;
		user-select: none;
	}

	.question-answer {
		padding-left: 1rem;
		user-select: text;
	}

	@media (max-width: 768px) {
		.questions {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
