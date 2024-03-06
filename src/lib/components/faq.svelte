<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';
	import Accordion from './accordion.svelte';

	export let user: AuthUser;
	export let questions: InfoBox[];

	let columnOne: InfoBox[] = questions.slice(0, Math.ceil(questions.length / 2));
	let columnTwo: InfoBox[] = questions.slice(Math.ceil(questions.length / 2) + 1);

	let questionsSplit: InfoBox[][] = [columnOne, columnTwo];
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
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
			{#if questions.length > 0}
				<div class="faq-questions-container">
					{#each { length: 2 } as _i, idx}
						<div class="faq-questions-col-{2 - (idx % 2)}">
							{#each questionsSplit[idx] as question}
								<Accordion>
									<span slot="head" class="question-title">{question.title}</span>
									<div slot="details" class="question-answer">
										<p>{question.response}</p>
										{#if user?.roles.includes('ADMIN')}
											<p class="edit">
												<a href="/admin/faq/{question.id}">Edit</a>
											</p>
										{/if}
									</div>
								</Accordion>
							{/each}
						</div>
					{/each}
				</div>
			{:else}
				<h2 class="no-faq-message">Check back for the FAQ!</h2>
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

	.faq-questions {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.faq-container {
		display: flex;
		width: 75rem;
		margin: auto;
		padding-top: 9vh;
	}

	.faq-title-container {
		position: sticky;
		top: 10vh;
		height: 650px;
		width: 135px;
	}

	.faq-title {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		align-items: flex-start;
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-size: 7rem;
		color: var(--highlight-color);
		text-shadow: none;
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}

	.left-border-faq-2 {
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 7rem;
		font-weight: normal;
		color: var(--background-color);
		text-shadow: none;
		-webkit-text-stroke: 0.1rem var(--highlight-color);
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}

	.faq-questions-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: min-content;
		margin-top: 1vh;
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

		.faq-questions-container {
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
	}

	.no-faq-message {
		color: var(--highlight-color);
	}
</style>
