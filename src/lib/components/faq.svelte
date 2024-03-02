<script lang="ts">
	import type { OtherCategories, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let questions: OtherCategories[] | null;

	let flippedCard: number = -1;

	function flipCard(index: number): void {
		if (flippedCard === index) {
			flippedCard = -1;
		} else {
			flippedCard = index;
		}
	}

	function keyDown(event: KeyboardEvent, index: number): void {
		if (event.key === 'Enter') flipCard(index);
	}
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
		<div class="faq-cards">
			{#if questions !== null}
				{#each questions as question, index}
					<div
						class="card"
						on:click={() => flipCard(index)}
						on:keydown={(event) => keyDown(event, index)}
					>
						<div class="card-container">
							{#if flippedCard === index}
								<div class="faq-answer">
									{question.response}
								</div>
							{:else}
								<div class="faq-question">
									{question.title}
								</div>
							{/if}
							{#if user?.roles.includes('ADMIN')}
								<p>
									<a class="edit" href="/admin/faq/{question.id}">Edit</a>
								</p>
							{/if}
						</div>
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
	}

	.faq-container {
		display: flex;
	}

	.faq-title {
		display: flex;
		flex-direction: column;
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

	.faq-cards {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		flex-grow: 1;
		flex-basis: 1rem;
		padding-right: 8vw;
	}

	.card {
		width: calc(47.5%);
		height: 25vh;
		top: 234px;
		left: 70px;
		border-radius: 7px;
		border: 3px solid white;
		background-color: rgba(255, 255, 255, 0);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 16px;
		font-weight: bold;
	}

	.faq-question {
		/* TODO */
	}

	.faq-answer {
		/* TODO */
	}

	h2 {
		font-family: 'Fugaz One';
		color: #f2ebd9;
		text-align: left;
		font-size: 36px;
		text-shadow: 0 4px 8px rgb(0, 0, 0);
	}

	@media (max-width: 1089px) {
		.faq-container {
			flex-direction: column;
		}

		.faq-cards {
			flex-direction: column;
			padding-right: 0;
		}

		.card {
			width: calc(75%);
			margin-bottom: 1rem;
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
