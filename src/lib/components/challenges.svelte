<script lang="ts">
	import type { Challenge } from '@prisma/client';

	interface Props {
		challenges: Challenge[];
	}

	let { challenges }: Props = $props();
</script>

<div class="home-content">
	<h1>Challenges</h1>
	<div class="container">
		{#each challenges as challenge}
			<div class="prize-card">
				<h3 id="prize-title">{challenge.title}</h3>

				{#if challenge.prize}
					<h5>{challenge.prize}</h5>
				{:else}
					<h5>Prize: Something Amazing</h5>
				{/if}

				<p>{challenge.description}</p>
			</div>
		{/each}
	</div>
</div>

<style>
	h1 {
		text-align: center;
	}

	h3 {
		text-align: center;
		margin-bottom: 8px;
	}

	h5 {
		text-align: center;
		color: var(--secondary-color-1);
		margin: 4px;
	}

	.container {
		columns: 20rem;
		gap: 30px;
	}

	.prize-card {
		break-inside: avoid;
		margin-bottom: 50px;
		border: 3px solid var(--accent);
		border-radius: var(--border-radius);
		padding: 0 1.5em 1.5em 1.5em;
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
