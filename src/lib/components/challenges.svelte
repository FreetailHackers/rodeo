<script lang="ts">
	import type { InfoBox } from '@prisma/client';

	export let challenges: InfoBox[];
</script>

<div class="home-content">
	<h2>Prizes</h2>
	<div class="container">
		{#each challenges as challenge}
			{#if challenge.category === 'CHALLENGE'}
				<div>
					<h6>{challenge.title}</h6>
					<p>{challenge.response}</p>
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
