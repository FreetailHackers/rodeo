<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';

	export let user: AuthUser;
	export let challenges: InfoBox[];

	let flippedCard: string | null = null;

	function toggleFlip(challenge: string | null) {
		flippedCard = flippedCard === challenge ? null : challenge;
	}

	function handleMouseLeave() {
		if (!flippedCard) {
			return;
		}
		flippedCard = null;
	}

	function handleKeyDown(event: KeyboardEvent, challenge: string | null) {
		if (event.key === 'Enter') {
			toggleFlip(challenge);
		}
	}
</script>

{#if challenges.length > 0}
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
						<div class="challenge-wrapper" on:mouseleave={handleMouseLeave}>
							<div
								class="challenge-box"
								class:flipped={flippedCard === challenge.title}
								on:click={() => toggleFlip(challenge.title)}
								on:keydown={(event) => handleKeyDown(event, challenge.title)}
							>
								<div class={flippedCard === challenge.title ? 'description-text' : 'content'}>
									{flippedCard === challenge.title ? challenge.response : challenge.title}
								</div>
							</div>
							{#if user?.roles.includes('ADMIN')}
								<div class="edit">
									<a href="/admin/homepage/challenges/{challenge.id}">Edit</a>
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>
{/if}

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
		margin: 0px auto;
		max-width: 90%;
	}

	.challenge-box {
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
		user-select: none;
	}

	.challenge-box.flipped {
		background-color: #e1563f;
		border-color: transparent;
	}

	.challenge-box.flipped .content {
		color: #f2ebd9; /* Change text color when flipped */
	}

	.challenge-box .content {
		text-align: center;
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 24px;
		transition: top 0.3s ease;
		position: absolute;
		transform: translate(-50%, -50%);
		font-size: 1.5em;
	}

	.challenge-wrapper {
		width: 50%;
		padding: 10px;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.challenge-wrapper:hover .content {
		top: 30%;
	}

	.content {
		text-align: center;
		font-family: 'Zen Dots';
		font-style: normal;
		font-size: 24px;
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
		top: 50%;
		left: 50%;
		width: 87.5%;
		transition: top 0.3s ease;
		user-select: none;
		font-size: 0.8em;
	}

	.challenge-box:hover {
		background-color: #e1563f;
		color: #f2ebd9;
	}

	.challenge-box:hover .content {
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
		.challenge-wrapper {
			width: 100%;
		}
		.challenge-box .content {
			font-size: min(4vw, 36px);
		}
		.challenge-box .description-text {
			font-size: min(2.5vw, 24px);
		}
	}
</style>
