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
			<h2 class="left-border-faq">FAQ</h2>
			<h2 class="left-border-faq-2">FAQ</h2>
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
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-size: 8rem;
		color: var(--highlight-color);
		text-shadow: none;
		transform: rotate(90deg);
	}

	.left-border-faq-2 {
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 8rem;
		font-weight: normal;
		color: var(--background-color);
		text-shadow: none;
		-webkit-text-stroke: 0.1rem var(--highlight-color);
		transform: rotate(90deg);
	}

	.faq-questions {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		/* TODO: change this width to fill up */
		flex-grow: 2;
	}

	.question {
		padding: 0 5vw;
	}

	h2 {
		font-family: 'Fugaz One';
		color: var(--highlight-color);
		text-align: center;
		font-size: 36px;
		margin-top: 0;
		margin-bottom: 0;
	}

	@media (max-width: 1089px) {
		.faq-container {
			flex-direction: column;
		}

		.left-border-faq {
			text-align: center;
			margin-bottom: 1rem;
			font-size: 4rem;
			transform: none;
		}

		.left-border-faq-2 {
			display: none;
		}
	}
</style>
