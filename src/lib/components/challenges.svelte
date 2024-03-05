<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let challenges: InfoBox[];

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
	<div class="challenges-container">
		<h1 class="desktop">
			<span class="bordered-text" data-text="Challenges">Challenges</span> Challenges
			<span class="bordered-text" data-text="Challenges">Challenges</span>
		</h1>
		<h1 class="mobile">Challenges</h1>

		<div class="container">
			{#each challenges as challenge}
				{#if challenge.category === 'CHALLENGE'}
					<div class="category-wrapper" on:mouseleave={() => handleMouseLeave()}>
						<div
							class="category-box {flippedCard === challenge.title ? 'flipped' : ''}"
							on:click={() => handleClick(challenge.title)}
							on:keydown={(event) => handleKeyDown(event, challenge.title)}
						>
							<div class={flippedCard === challenge.title ? 'description-text' : 'content'}>
								{flippedCard === challenge.title ? challenge.response : challenge.title}
							</div>
						</div>
						{#if user?.roles.includes('ADMIN')}
							<div class="edit">
								<a href="/admin/challenges/{challenge.id}">Edit</a>
							</div>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.challenges-container {
		flex-wrap: wrap;
		max-width: 75rem;
		margin: auto;
	}

	.checkered-background {
		background-color: #303030;
		background-image: url('/Checkered Background.svg');
		background-size: cover;
	}

	.bordered-text {
		font-family: 'Zen Dots';
		font-style: normal;
		color: #1d1d1c;
		-webkit-text-stroke: 1px #f2ebd9;
	}

	h1 {
		color: #ffffff;
		font-size: 40px;
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
		word-wrap: break-word;
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
		border-color: transparent;
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
		font-size: 1.5em;
	}

	.category-wrapper {
		width: 50%;
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
		user-select: none;
		font-size: 1em;
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
		.category-box .content {
			font-size: min(4vw, 36px);
		}
		.category-box .description-text {
			font-size: min(2vw, 24px);
		}
	}
</style>
