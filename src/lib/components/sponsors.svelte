<script lang="ts">
	export let sponsors: string[][];
</script>

<div class="homepage-content">
	<h1>Sponsors</h1>
	<p>
		Our success is fueled by incredible sponsors hosting workshops, job opportunities, prizes, and
		more.
	</p>

	<button
		><a href="mailto:corporate@freetailhackers.com" target="_blank" rel="noopener noreferrer"
			>Become a sponsor</a
		></button
	>
	<div class="sponsor-container">
		{#each sponsors as sponsor}
			<div class="sponsor-card">
				<a
					href={sponsor[1]}
					class:nohover={sponsor[1] === '#'}
					target="_blank"
					rel="noopener noreferrer"
				>
					<img alt={sponsor[0]} src={`/Sponsors/${sponsor[0]}.png`} />
				</a>
			</div>
		{/each}
	</div>
</div>

<style>
	p {
		text-align: center;
	}

	.nohover {
		pointer-events: none;
	}

	button {
		font-size: 20px;
		display: block;
		margin: 20px auto;
		padding: 0 2em;
		box-shadow: 0 0.5rem 0.75rem rgba(0, 0, 0, 0.336);
	}

	a {
		color: var(--background-color);
		text-decoration: none;
	}

	.sponsor-container {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		max-width: 1200px;
		margin: 0 auto;
	}

	.sponsor-card {
		flex: 0 0 calc(33.333% - 20px);
		margin: 10px;
		margin-bottom: 25px;
		background-color: #fffff9;
		padding: 10px;
		box-sizing: border-box;
		max-width: 300px;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 10px 10px #e1563f;
		transition: all 0.4s ease;
	}

	.sponsor-card img {
		max-height: 150px;
		max-width: 100%;
		height: auto;
		display: block;
		margin: 0 auto;
	}

	.sponsor-card:hover {
		border-radius: 0% 0% 50% 50% / 0% 0% 5% 5%;
		box-shadow: 10px 10px rgba(165, 0, 0, 0.781);
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 9.5vw;
			padding: 16px;
		}

		button,
		p {
			font-size: 16px;
		}
	}
</style>
