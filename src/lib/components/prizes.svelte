<script lang="ts">
	import type { OtherCategories, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let prizes: OtherCategories[];

	let flippedCard: string | null = null;

	function toggleFlip(category: string | null) {
		flippedCard = flippedCard === category ? null : category;
	}

	function handleMouseLeave() {
		if (!flippedCard) {
			return;
		}
		flippedCard = null;
	}

	function handleClick(category: string | null) {
		flippedCard = flippedCard === category ? null : category;
	}

	function handleKeyDown(event: KeyboardEvent, category: string | null) {
		if (event.key === 'Enter') {
			toggleFlip(category);
		}
	}
</script>

<div class="checkered-background">
	<h1 class="desktop">
		<span class="bordered-text" data-text="Prizes">Prizes</span> Prizes
		<span class="bordered-text" data-text="Prizes">Prizes</span>
	</h1>
	<h1 class="mobile">Prizes</h1>

	<div class="container">
		{#each prizes as prize}
			<div class="category-wrapper" on:mouseleave={() => handleMouseLeave()}>
				<div
					class="category-box {flippedCard === prize.title ? 'flipped' : ''}"
					on:click={() => handleClick(prize.title)}
					on:keydown={(event) => handleKeyDown(event, prize.title)}
				>
					<div class={flippedCard === prize.title ? 'description-text' : 'content'}>
						{flippedCard === prize.title ? prize.response : prize.title}
					</div>
				</div>
				{#if user?.roles.includes('ADMIN')}
					<div class="edit">
						<a href="/admin/prizes/{prize.id}">Edit</a>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.checkered-background {
		background-color: #303030;
		background-image: url('/Checkered Background.svg');
		background-size: cover; /* Ensure the background covers the entire container */
		min-height: 100vh;
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
		flex-wrap: wrap;
		justify-content: center;
		margin: 20px auto;
		max-width: 90%;
	}

	.category-box {
		position: relative;
		width: 100%;
		height: 150px;
		border-radius: 10px;
		border: 3px solid white;
		background-color: rgba(255, 255, 255, 0);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: 16px;
		font-weight: bold;
		transition: background-color 0.3s ease, border 0.3s ease;
		cursor: pointer;
		margin-bottom: 10px;
	}

	.category-box.flipped {
		background-color: #e1563f;
		border-color: transparent; /* Change border color to transparent */
	}

	.category-box.flipped .content {
		color: #f2ebd9; /* Change text color when flipped */
	}

	.category-box .content {
		text-align: center;
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 24px;
		transition: top 0.3s ease;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.category-wrapper {
		width: 33.33%;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.category-wrapper:hover .content {
		top: 30%;
	}

	.content {
		text-align: center;
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 24px;
		position: absolute;
		top: 50%;
		left: 50%;
		width: 75%;
		transform: translate(-50%, -50%);
		transition: top 0.3s ease;
	}

	.description-text {
		font-family: 'Geologica';
		font-style: normal;
		font-size: 14px;
		position: absolute;
		top: 50%;
		left: 50%;
		width: 87.5%;
		transform: translate(-50%, -50%);
		transition: top 0.3s ease;
	}

	.category-box:hover {
		background-color: #e1563f;
		color: #f2ebd9;
	}

	.category-box:hover .content {
		top: 40%;
	}

	.flipped {
		background-color: #e1563f;
		color: #f2ebd9;
	}

	.desktop {
		display: block;
	}

	.mobile {
		display: none;
	}

	@media (max-width: 768px) {
		.desktop {
			display: none;
		}
		.mobile {
			display: block;
		}
		.category-wrapper {
			width: 100%;
		}
	}
</style>
