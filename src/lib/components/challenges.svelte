<script lang="ts">
	import type { Challenge } from '@prisma/client';

	export let challenges: Challenge[];
</script>

<div class="home-content">
	<h1>Challenges</h1>
	<div class="container">
		{#each challenges as challenge}
			<div class="prize-card">
				<h3 id="prize-title">{challenge.title}</h3>

				<div class="prize-name">
					{#if challenge.prize}
						<h5>{challenge.prize}</h5>
					{:else}
						<h5>Prize: Something Amazing</h5>
					{/if}
				</div>
				<p>{challenge.description}</p>
			</div>
		{/each}
	</div>
</div>

<style>
	h1 {
		font-family: var(--font-family);
		display: flex;
		justify-content: center;
		font-size: 48px;
	}

	h3 {
		font-family: var(--font-family);
		color: var(--accent-color);
		text-align: center;
		/* Header 3 */
		font-size: 28px;
		font-style: normal;
		font-weight: 700;
		line-height: normal;
		text-transform: uppercase;
		margin-bottom: 2px;
	}

	h5 {
		font-family: var(--font-family);
		color: var(--accent-color);
		text-transform: capitalize;
		font-size: 20px;
		font-style: normal;
		font-weight: 700;
		line-height: normal;
		text-align: center;
		margin-top: 2px;
		margin-bottom: 16px;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: flex-end;
		align-content: flex-end;
		gap: 38px 39px;
		flex-wrap: wrap;
	}

	.prize-card {
		display: flex;
		flex-direction: column;
		width: 30%;
		border: 3px solid var(--accent-color);
		border-radius: 20px;
		padding: 0 25px 25px 25px;
	}

	@media (max-width: 768px) {
		.container {
			display: flex;
			flex-direction: column;
			align-content: center;
		}

		.prize-card {
			width: 100%;
		}
	}
</style>
