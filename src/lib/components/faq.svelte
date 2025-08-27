<script lang="ts">
	import type { FAQ } from '@prisma/client';
	import Accordion from './accordion.svelte';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';

	interface Props {
		faqs: FAQ[];
	}

	let { faqs }: Props = $props();

	const splitQuestions = (faqs: FAQ[]) => {
		const middleIndex = Math.ceil(faqs.length / 2);
		return [faqs.slice(0, middleIndex), faqs.slice(middleIndex)];
	};

	const [columnOne, columnTwo] = splitQuestions(faqs);
</script>

<div class="home-content">
	<h1>Any Questions?</h1>
	<div class="questions">
		{#each [columnOne, columnTwo] as column}
			<div class="questions-col">
				{#each column as faq}
					<Accordion>
						{#snippet head()}
							<span class="question-title">{faq.question}</span>
						{/snippet}
						{#snippet details()}
							<div class="question-answer">
								<SvelteMarkdown source={faq.answer} />
							</div>
						{/snippet}
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
		font-weight: bold;
		color: var(--accent);
	}

	.question-title {
		cursor: pointer;
	}

	.question-answer {
		padding-left: 1rem;
		user-select: text;
		font-weight: normal;
	}

	@media (max-width: 768px) {
		.questions {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
