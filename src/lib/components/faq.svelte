<script lang="ts">
	// import { enhance } from '$app/forms';
	// import type { FAQ } from '@prisma/client';

	// export let user: AuthUser;
	// export let questions: FAQ[];
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>

<div class="background">
	<div class="faq">
		<div class="show-large">
			<h2 class="left-border-faq">FAQ</h2>
			<h2 class="left-border-faq-2">FAQ</h2>
		</div>
		<div class="show-small">
			<h2 class="mobile-title">FAQ</h2>
		</div>
	</div>

	<div class="faq-view">
		<!-- {#if questions.length > 0}
			<div class="container">
				{#each questions as question}
					<div class="card">
						<div class="card-container">
							<div class="faq-question">
								{question.question}
							</div>
							<div class="faq-answer">
								{question.answer}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<h2>Check back for the FAQ!</h2>
		{/if} -->

		<!-- <div class="faq-cards" /> -->
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

	.show-large {
		display: none;
	}

	.show-small {
		display: contents;
	}

	@media (min-width: 1090px) {
		.show-large {
			display: contents;
		}

		.show-small {
			display: none;
		}
	}

	.background {
		background-color: var(--background-color);
		display: flex;
		align-items: center;
	}

	.faq {
		/* margin-top: 100px; */
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 1rem;
		/* padding-left: 0; */
		/* background-color: var(--background-color); */
	}

	.left-border-faq {
		font-family: 'Zen Dots', sans-serif;
		font-style: normal;
		font-size: 8rem;
		color: #f2ebd9;
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
		-webkit-text-stroke: 0.1rem #f2ebd9;
		transform: rotate(90deg);
	}

	.mobile-title {
		margin-left: 2rem;
	}

	h2 {
		font-family: 'Fugaz One';
		color: #f2ebd9;
		text-align: left;
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	/* CARD SPECIFIC CSS */
	/* .card {
		border: 4px solid var(--highlight-color);
		width: 25rem;
		height: 200px;
		margin: 10px;
		border-radius: 10px;
	}

	.card:hover {
		background-color: var(--secondary-color);
		cursor: pointer;
	} 

	.card-container {
		width: 100%;
		height: 100%;
		position: relative;
		transition: transform 1s;
		transform-style: preserve-3d;
	}
	*/
</style>
