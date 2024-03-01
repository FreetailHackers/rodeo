<script lang="ts">
	import type { OtherCategories, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let prizes: OtherCategories[];

	// Define which card is currently flipped
	// let flippedCard: string | null = null;

	// Function to toggle flipped state of a card
	// function toggleFlip(category: string | null) {
	// 	flippedCard = flippedCard === category ? null : category;
	// }

	// Handle keyboard events for accessibility
	// function handleKeyDown(event: KeyboardEvent, category: string | null) {
	// 	if (event.key === 'Enter') {
	// 		toggleFlip(category);
	// 	}
	// }
</script>

<div class="checkered-background">
	<h1>
		<span class="bordered-text" data-text="Prizes">Prizes</span> Prizes
		<span class="bordered-text" data-text="Prizes">Prizes</span>
	</h1>

	<div class="container">
		{#each prizes as prize}
			<div class="centered">
				<div class="front">{prize.title}</div>
				<div class="back">{prize.response}</div>
				{#if user?.roles.includes('ADMIN')}
					<p>
						<a class="edit" href="/admin/prizes/{prize.id}">Edit</a>
					</p>
				{/if}
				<!-- <div
					class="box {flippedCard === category ? 'flipped' : ''} {flippedCard === category
						? 'orange'
						: ''}"
					on:click={() => toggleFlip(category)}
					on:keydown={(event) => handleKeyDown(event, category)}
				>
					<div class="content {flippedCard === category ? 'description' : ''}">
						{flippedCard === category ? prizeCategories.get(category) : category}
					</div>
				</div> -->
			</div>
		{/each}
	</div>
	<!-- {#each prizes as prize}
		<div class="container centered">
			<div
				class="box {flippedCard === category ? 'flipped' : ''} {flippedCard === category
					? 'orange'
					: ''}"
				on:click={() => toggleFlip(category)}
				on:keydown={(event) => handleKeyDown(event, category)}
			>
				<div class="content {flippedCard === category ? 'description' : ''}">
					{flippedCard === category ? prizeCategories.get(category) : category}
				</div>
			</div>
		</div>
	{/each} -->
</div>

<style>
	.checkered-background {
		background-color: #303030;
		background-image: url('/Checkered Background.svg');
		background-size: 110%;
		min-height: 100vh; /* kick footer to bottom of page */
	}

	.bordered-text {
		font-family: 'Zen Dots';
		font-style: normal;
		color: #1d1d1c;
		-webkit-text-stroke: 1px #f2ebd9;
	}

	h1 {
		color: #ffffff;
		font-size: 64px;
		font-weight: 400;
		margin: 0;
		text-align: center;
		text-shadow: 0 4px 12px black;
		padding-top: 48px;
	}

	.container {
		display: flex;
		justify-content: space-between;
		margin: 20px auto;
		max-width: 90%;
	}

	/* .box {
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

	.content {
		text-align: center;
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 48px;
	}

	.box:hover {
		background-color: #e1563f;
		color: #f2ebd9;
	}

	.centered {
		justify-content: center;
	}

	.description {
		font-size: 16px;
		font-family: 'Geologica';
	}

	.orange {
		background-color: #e1563f;
		color: #f2ebd9;
	} */
</style>
