<script lang="ts">
	import type { PrizeBox } from '@prisma/client';

	export let prizes: PrizeBox[];
</script>

<div class="home-content">
	<h1>Prizes</h1>
	<div class="container">
		{#each prizes as prize}
			<div
				class="prize-card {prize.prizeType === 'FIRST'
					? 'first-prize-card'
					: prize.prizeType === 'SECOND'
					? 'second-prize-card'
					: prize.prizeType === 'THIRD'
					? 'third-prize-card'
					: ''}"
			>
				<h3 id="prize-title">{prize.title}</h3>

				<div class="prize-name">
					{#if prize.prize}
						<h5>{prize.prize}</h5>
					{:else}
						<h5>Prize: Something Amazing</h5>
					{/if}
				</div>

				{#if prize.prizeType === ('CHALLENGE' || 'SPONSOR')}
					<p class="prize-info">{prize.description}</p>
				{:else}
					<div class="prize-image" />
				{/if}
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

	.first-prize-card {
		background-color: var(--light-accent);
		height: 450px;
		order: -2;
	}

	.second-prize-card {
		background-color: var(--light-accent);
		height: 350px;
		order: -3;
	}

	.third-prize-card {
		background-color: var(--light-accent);
		order: -1;
		height: 250px;
	}

	.prize-image {
		background-color: var(--light-gray);
		width: 100%;
		height: 100%;
		border-radius: 15px;
	}

	.prize-info {
		margin-top: 2px;
		padding-top: 2px;
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

		.first-prize-card {
			order: 0;
		}

		.second-prize-card {
			order: 0;
		}

		.third-prize-card {
			order: 0;
		}
	}
</style>
