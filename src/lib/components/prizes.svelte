<script lang="ts">
	import type { InfoBox } from '@prisma/client';

	export let prizes: InfoBox[];
</script>

<div class="home-content">
	<h2>Prizes</h2>
	<div class="container">
		{#each prizes as prize}
			{#if prize.category === 'CHALLENGE'}
				<div>
					<h6>{prize.title}</h6>
					<p>{prize.response}</p>
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
