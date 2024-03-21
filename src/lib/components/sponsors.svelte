<script lang="ts">
	export let sponsors: string[][];
</script>

<div class="main-container">
	<img class="background-grid" src="/Grid.png" alt="Grid Background" />
	<div class="content-container">
		<h1>Sponsors</h1>
		<p>
			Our success is fueled by incredible sponsors hosting workshops, job opportunities, prizes, and
			more.
		</p>

		<!-- This code assumes that the sponsor logo is saved under /static/Sponsors/ as a PNG with the same name as the company. -->
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
</div>

<style>
	.nohover {
		pointer-events: none;
	}

	.main-container {
		position: relative;
		background-color: #1c1c1c;
		overflow: hidden;
	}

	button {
		font-size: 20px;
		display: block;
		margin: 20px auto;
		padding: 0 2em;
		box-shadow: 0 0.5rem 0.75rem black;
	}

	.background-grid {
		width: inherit;
		height: inherit;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
		pointer-events: none;
		opacity: 0.8;
		object-fit: cover;
		mask-image: linear-gradient(
			to bottom,
			transparent 0%,
			rgba(0, 0, 0, 0.5) 40%,
			rgba(0, 0, 0, 0.5) 60%,
			transparent 100%
		);
	}

	.content-container {
		position: relative;
		padding: 40px;
		box-sizing: border-box;
		z-index: 2;
	}

	h1,
	p {
		text-align: center;
		font-size: 20px;
		color: #f2ebd9;
	}

	h1 {
		font-size: 64px;
		font-weight: 400;
		margin: 0;
		padding: 24px 0;
		color: #e1563f;
		text-shadow: 0 4px 12px black;
		white-space: nowrap;
	}

	a {
		color: #f2ebd9;
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
