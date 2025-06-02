<script lang="ts">
	import type { AuthUser, Sponsor } from '@prisma/client';
	interface Props {
		user: AuthUser;
		sponsors: (Sponsor & { imageUrl: string | null })[];
	}

	let { user, sponsors }: Props = $props();
</script>

<div class="content-container">
	<h1>Thank you to our Sponsors!</h1>

	<div class="sponsor-container">
		{#each sponsors as sponsor}
			<div class="format-edit-and-sponsor">
				<div class="sponsor-card">
					<a href={sponsor.url} target="_blank" rel="noopener noreferrer">
						<img src={sponsor.imageUrl} alt={sponsor.name} />
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

<style>
	.content-container {
		text-align: center;
	}

	.format-edit-and-sponsor {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.content-container {
		position: relative;
		padding: 40px;
		box-sizing: border-box;
		z-index: 2;
	}

	.sponsor-container {
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		max-width: 1200px;
		margin: 0 auto;
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
