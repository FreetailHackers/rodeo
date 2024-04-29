<script lang="ts">
	import type { InfoBox, AuthUser } from '@prisma/client';
	export let user: AuthUser;
	export let sponsors: InfoBox[];
	export let sponsorLinks: Record<string, string>;
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
				<div class="format-edit-and-sponsor">
					<div class="sponsor-card">
						<a href={sponsor.title} target="_blank" rel="noopener noreferrer">
							<img alt="Sponsor_Image" src={`${sponsorLinks[sponsor.response]}`} />
						</a>
					</div>
					{#if user?.roles.includes('ADMIN')}
						<div class="edit">
							<a href="/admin/homepage/sponsors/{sponsor.id}">Edit</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.format-edit-and-sponsor {
		display: flex;
		flex-direction: column;
		align-items: center;
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

	.edit a {
		color: #e1563f;
		text-decoration: underline;
	}

	.sponsor-container {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		max-width: 1200px;
		margin: 0 auto;
	}

	.sponsor-card {
		margin: 10px;
		background-color: #fffff9;
		padding: 10px;
		box-shadow: 10px 10px #e1563f;
		transition: all 0.4s ease;
	}

	.sponsor-card img {
		width: 250px;
		height: 150px;
		object-fit: contain;
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

		.sponsor-card img {
			width: 125px;
			height: 100px;
		}
	}
</style>
