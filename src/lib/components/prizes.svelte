<script lang="ts">
	let prizeCategories: Map<string, string> = new Map();
	prizeCategories.set('Category 1', 'Prize description for Category 1');
	prizeCategories.set('Category 2', 'Prize description for Category 2');
	prizeCategories.set('Category 3', 'Prize description for Category 3');
	prizeCategories.set('Category 4', 'Prize description for Category 4');
	prizeCategories.set('Category 5', 'Prize description for Category 5');
	prizeCategories.set('Category 6', 'Prize description for Category 6');
	// prizeCategories.set('Category 7', 'Prize description for Category 7'); // Odd number of categories for testing

	// Define which card is currently flipped
	let flippedCard: string | null = null;

	// Function to toggle flipped state of a card
	function toggleFlip(category: string | null) {
		flippedCard = flippedCard === category ? null : category;
	}

	// Handle keyboard events for accessibility
	function handleKeyDown(event: KeyboardEvent, category: string | null) {
		if (event.key === 'Enter') {
			toggleFlip(category);
		}
	}

	// Function to group categories into pairs
	function groupIntoPairs(categories: string[]) {
		const pairs = [];
		for (let i = 0; i < categories.length; i += 2) {
			const pair = [categories[i], categories[i + 1] || null]; // Add null for odd number of categories
			pairs.push(pair);
		}
		return pairs;
	}

	// Group categories into pairs
	let categoryPairs = groupIntoPairs(Array.from(prizeCategories.keys()));
</script>

<div class="checkered-background">
	<h1>
		<span class="bordered-text" data-text="Prizes">Prizes</span> Prizes
		<span class="bordered-text" data-text="Prizes">Prizes</span>
	</h1>

	{#each categoryPairs as pair}
		<div class="container {pair[1] === null ? 'centered' : ''}">
			{#each pair as category}
				{#if category !== null}
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
				{/if}
			{/each}
		</div>
	{/each}
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

	.box {
		width: calc(47.5%);
		height: 25vh;
		top: 234px;
		left: 70px;
		border-radius: 10px;
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
	}
</style>
