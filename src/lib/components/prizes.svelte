<script lang="ts">
	import type { PrizeBox } from '@prisma/client';

	export let prizes: PrizeBox[];
</script>

<div class="home-content">
	<h2>Prizes</h2>
	<div class="container">
		{#each prizes as prize}
			{#if prize.prizeType !== 'SPONSOR'}
				<div>
					<h6>{prize.title}</h6>
					<p>{prize.description}</p>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
	}
</style>
