<script lang="ts">
	import type { OtherCategories, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let questions: OtherCategories[] | null;
</script>

<svelte:head>
	<title>Rodeo | FAQ</title>
</svelte:head>

<div class="background">
	<div class="faq">
		<h2 class="left-border-faq">FAQ</h2>
		<h2 class="left-border-faq-2">FAQ</h2>
	</div>

	<div class="faq-view">
		<div class="faq-cards">
			{#if questions !== null}
				<div class="container">
					{#each questions as question}
						<div class="card">
							<div class="card-container">
								<div class="faq-question">
									{question.title}
								</div>
								<div class="faq-answer">
									{question.response}
								</div>
							</div>
						</div>
					{/each}
				</div>
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

	h2 {
		font-family: 'Fugaz One';
		color: #f2ebd9;
		text-align: left;
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	@media (max-width: 1089px) {
		.left-border-faq {
			margin-left: 2rem;
			font-size: 36px;
			transform: none;
		}

		.left-border-faq-2 {
			display: none;
		}
	}
</style>
