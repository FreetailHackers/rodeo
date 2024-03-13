<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';
	import Accordion from './accordion.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: AuthUser;
	export let questions: InfoBox[];

	let columnOne: InfoBox[] = questions.slice(0, Math.ceil(questions.length / 2));
	let columnTwo: InfoBox[] = questions.slice(Math.ceil(questions.length / 2) + 1);

	let questionsSplit: InfoBox[][] = [columnOne, columnTwo];
</script>

<svelte:head>
	<title>Formula Hacks | FAQ</title>
</svelte:head>

<div class="background">
	<div class="faq-container">
		<div class="faq-title-container">
			<div class="faq-title">
				<h1 class="left-border-faq">FAQ</h1>
				<h1 class="left-border-faq-2">FAQ</h1>
			</div>
		</div>
		<div class="faq-questions">
			{#if questionsSplit.length > 0}
				{#each { length: 2 } as _i, idx}
					<div class="faq-questions-col-{2 - (idx % 2)}">
						{#each questionsSplit[idx] as question}
							<Accordion>
								<span slot="head" class="question-title">{question.title}</span>
								<div slot="details" class="question-answer">
									<SvelteMarkdown source={question.response} />
									{#if user?.roles.includes('ADMIN')}
										<p class="edit">
											<a href="/admin/homepage/faq/{question.id}">Edit</a>
										</p>
									{/if}
								</div>
							</Accordion>
						{/each}
					</div>
				{/each}
			{:else}
				<h2>Check back for the FAQ!</h2>
			{/if}
		</div>
	</div>
</div>

<style>
	.background {
		background-color: var(--background-color);
		display: flex;
		justify-content: center;
	}

	.faq-container {
		display: flex;
		max-width: 75rem;
		padding: 3em 0;
		padding-right: 2em;
	}

	.faq-title-container {
		position: sticky;
		top: 10vh;
		height: 650px;
		width: 7rem;
		flex-shrink: 0;
	}

	.faq-title {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.left-border-faq,
	.left-border-faq-2 {
		font-family: 'Zen Dots', sans-serif;
		font-size: 7rem;
		color: var(--highlight-color);
		writing-mode: vertical-rl;
	}

	.left-border-faq-2 {
		color: transparent;
		-webkit-text-stroke: 0.1rem var(--highlight-color);
	}

	.faq-questions {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: min-content;
		margin-top: 1em;
		cursor: default;
		user-select: none;
	}

	.faq-questions-col-1,
	.faq-questions-col-2 {
		flex-grow: 1;
		padding-left: 5vw;
	}

	h1 {
		font-family: 'Fugaz One';
		color: var(--highlight-color);
		text-align: center;
		font-size: 36px;
		margin: 0;
	}

	@media (max-width: 768px) {
		.faq-container {
			flex-direction: column;
			width: 100vw;
			padding-top: 4vw;
		}

		.faq-title-container {
			display: flex;
			position: unset;
			height: unset;
			width: auto;
			justify-content: center;
			align-self: center;
		}

		.left-border-faq {
			text-align: center;
			margin-bottom: 1rem;
			font-size: 9.5vw;
			writing-mode: unset;
			padding-top: unset;
			font-size: 64px;
			font-weight: 400;
		}

		.left-border-faq-2 {
			display: none;
		}

		.faq-questions {
			grid-template-columns: auto;
			padding-left: 0;
			gap: 0;
		}
	}

	.edit {
		margin: 0px;
	}

	.question-answer {
		padding-bottom: 0px;
		user-select: text;
	}
</style>
