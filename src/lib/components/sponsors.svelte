<script lang="ts">
	import type { AuthUser } from '@prisma/client';
	export let user: AuthUser;

	/*
      SponsorArray structure:
      [id, sponsorTitle (S3 key), response (website URL), sponsorLink (image URL on S3)]
    */
	type SponsorArray = (string | number)[];
	export let sponsors: SponsorArray[];
</script>

<div class="main-container">
	<div class="content-container">
		<h1>Thank you to our sponsors!</h1>
		<div class="sponsor-container">
			{#each sponsors as sponsor}
				<div class="format-edit-and-sponsor">
					<div class="sponsor-card">
						<a href={sponsor[2]?.toString()} target="_blank" rel="noopener noreferrer">
							<img alt="SponsorImage" src={`${sponsor[3]}`} />
						</a>
					</div>
					{#if user?.roles.includes('ADMIN')}
						<div class="edit">
							<a href="/admin/homepage/sponsors/{sponsor[0]}">Edit</a>
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
		overflow: hidden;
	}

	button {
		font-size: 20px;
		display: block;
		margin: 20px auto;
		padding: 0 2em;
		box-shadow: 0 0.5rem 0.75rem black;
	}

	.content-container {
		position: relative;
		padding: 40px;
		box-sizing: border-box;
		z-index: 2;
	}

	p {
		text-align: center;
		font-size: 20px;
		color: #f2ebd9;
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

	@media (max-width: 768px) {
		.sponsor-card img {
			width: 125px;
			height: 100px;
		}
	}
</style>
