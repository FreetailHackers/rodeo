<script lang="ts">
	import '../../routes/global.css';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let announcements: Announcement[];
</script>

<div class="background">
	<div class="home-content">
		<h2>Announcements</h2>
		<ul>
			{#each announcements as announcement}
				<li class="card">
					<div class="date-container">
						<span class="date">
							<p class="month-day">
								{announcement.published.toLocaleDateString('en-us', {
									month: 'long',
									day: 'numeric',
								})}
							</p>
							<span class="time">
								{announcement.published.toLocaleTimeString('en-us', {
									hour: 'numeric',
									minute: 'numeric',
								})}
							</span>
						</span>
					</div>

					<div class="text">
						<SvelteMarkdown source={announcement.body} />
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	:root {
		--spacing: 3rem;
	}

	.background {
		background-color: gray;
		padding-bottom: var(--spacing);
	}

	h2 {
		text-align: center;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		margin-bottom: var(--spacing);
	}

	ul li:last-child,
	p {
		margin: 0;
	}

	.card {
		background-color: white;
		border-radius: 25px / 35px;
		position: relative;
		padding: 1rem;
	}

	.date-container {
		position: absolute;
		top: -1rem;
		left: 1rem;
		width: 14rem;
		z-index: 1;
	}

	.date {
		background-color: var(--accent-color);
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: white;
		padding: 0.3rem 1rem;
	}

	.month-day {
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	.time {
		font-size: small;
		font-weight: lighter;
		font-style: italic;
		white-space: nowrap;
	}
</style>
