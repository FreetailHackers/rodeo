<script lang="ts">
	/*
      SponsorArray structure:
      [id, sponsorTitle (S3 key), response (website URL), sponsorLink (image URL on S3)]
    */
	type SponsorArray = (string | number)[];
	export let sponsors: SponsorArray[];
</script>

<div class="home-content">
	<h1>Thank you to our sponsors!</h1>
	<div class="container">
		{#each sponsors as sponsor}
			<div class="format-edit-and-sponsor">
				<div class="card">
					<a href={sponsor[2]?.toString()} target="_blank" rel="noopener noreferrer">
						<img alt="SponsorImage" src={`${sponsor[3]}`} />
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.format-edit-and-sponsor {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	a {
		color: #f2ebd9;
		text-decoration: none;
	}

	.container {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		max-width: 1200px;
		margin: 0 auto;
	}

	.card {
		margin: 10px;
		background-color: #fffff9;
		padding: 10px;
	}

	.card img {
		width: 250px;
		height: 150px;
		object-fit: contain;
	}

	@media (max-width: 768px) {
		.card img {
			width: 125px;
			height: 100px;
		}
	}
</style>
