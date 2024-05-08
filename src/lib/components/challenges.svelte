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

<div class="homepage-content">
	<h1>Challenges</h1>
	<div class="container">
		{#each challenges as challenge}
			{#if challenge.category === 'CHALLENGE'}
				<div class="wrapper" on:mouseleave={handleMouseLeave}>
					<div
						class="box"
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

<style>
	.container {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.box {
		position: relative;
		height: 150px;
		border-radius: 10px;
		border: 3px solid var(--primary-accent);
		color: var(--primary-accent);
		background-color: var(--background-color);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
		transition: background-color 0.3s ease, color 0.3s ease;
		margin: 0 20px 20px 0;
	}

	.box .content,
	.description-text {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		transform: translate(-50%, -50%);
		transition: top 0.3s ease;
		text-align: center;
	}

	.box:hover {
		background-color: var(--primary-accent);
		color: var(--background-color);
	}

	.box:hover .content {
		top: 40%;
	}

	.wrapper {
		width: calc(50% - 20px);
		margin-bottom: 20px;
	}

	@media (max-width: 768px) {
		.wrapper {
			width: 100%;
		}
	}
</style>
