<script lang="ts">
	import type { OtherCategories, AuthUser } from '@prisma/client';
	import Accordion from './accordion.svelte';

	export let user: AuthUser;
	export let questions: OtherCategories[] | null;
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>

<div class="background">
	<div class="faq-container">
		<div class="faq-title">
			<h1 class="left-border-faq">FAQ</h1>
			<h1 class="left-border-faq-2">FAQ</h1>
		</div>
		<div class="faq-questions">
			{#if questions !== null}
				{#each questions as question}
					<div class="question">
						<Accordion>
							<span slot="head" class="question-title">{question.title}</span>
							<div slot="details" class="question-answer">
								<p>{question.response}</p>
								{#if user?.roles.includes('ADMIN')}
									<p>
										<a class="edit" href="/admin/faq/{question.id}">Edit</a>
									</p>
								{/if}
							</div>
						</Accordion>
					</div>
				{/each}
			{:else}
				<h2>Check back for the FAQ!</h2>
			{/if}
		</div>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

	.background {
		background-color: var(--background-color);
		display: flex;
	}

	.faq-container {
		display: flex;
	}

	.faq-title {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		padding-right: 5vw;
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-size: 8rem;
		color: var(--highlight-color);
		text-shadow: none;
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}

	.left-border-faq-2 {
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 8rem;
		font-weight: normal;
		color: var(--background-color);
		text-shadow: none;
		-webkit-text-stroke: 0.1rem var(--highlight-color);
		writing-mode: vertical-rl;
		text-orientation: mixed;
	}

	.faq-questions {
		display: grid;
		align-items: baseline;
		grid-template-columns: 35vw 35vw;
		grid-auto-rows: min-content;
		padding-top: 2.5vw;
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
		}

		.faq-title {
			justify-content: center;
		}

		.left-border-faq {
			text-align: center;
			margin-bottom: 1rem;
			font-size: 4rem;
			writing-mode: unset;
		}

		.left-border-faq-2 {
			display: none;
		}

		.faq-questions {
			grid-template-columns: 100vw;
			padding-left: 5vw;
		}
	}
</style>
