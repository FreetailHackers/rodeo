<script lang="ts">
	import type { InfoBox } from '@prisma/client';
	import Accordion from './accordion.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let questions: InfoBox[];

	const splitQuestions = (questions: InfoBox[]) => {
		const middleIndex = Math.ceil(questions.length / 2);
		return [questions.slice(0, middleIndex), questions.slice(middleIndex)];
	};

	const [columnOne, columnTwo] = splitQuestions(questions);
</script>

<div class="home-content">
	<h2>Any Questions?</h2>
	<div class="faq-questions">
		{#each [columnOne, columnTwo] as column}
			<div class="faq-questions-col">
				{#each column as question}
					<Accordion>
						<span slot="head" class="question-title">{question.title}</span>
						<div slot="details" class="question-answer">
							<SvelteMarkdown source={question.response} />
						</div>
					</Accordion>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.faq-questions {
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
		.faq-questions {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
</style>
