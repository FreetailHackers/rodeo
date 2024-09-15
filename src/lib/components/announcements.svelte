<script lang="ts">
	import '../../routes/global.css';
	import type { Announcement } from '@prisma/client';
	import { enhance } from '$app/forms';
	import TextEditor from './text-editor.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	export let admin: boolean;

	export let announcements: Announcement[];
</script>

<section id="announcements">
	<h2>Announcements</h2>
	{#if admin}
		<form class="pad" method="POST" action="?/announce" use:enhance>
			<TextEditor
				name="announcement"
				placeholder="Make an announcement here..."
				isHTML={false}
				required
			/>
			<button class="announcement-button-label">Announce</button>
		</form>
	{/if}
	<ul>
		{#each announcements as announcement}
			<li class="card">
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

				<div class="text">
					<SvelteMarkdown source={announcement.body} />
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	:root {
		--spacing: 3rem;
	}

	#announcements {
	}

	h2 {
		text-align: center;
	}

	ul {
		list-style: none;
		padding: 1em;
		margin: 0;
		height: 25em;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
	}

	li {
		margin-bottom: var(--spacing);
		scroll-snap-align: start;
		scroll-margin-top: 3em;
	}

	ul li:last-child,
	p {
		margin: 0;
	}

	.card {
		background-color: var(--background-grey);
		border-radius: 50px;
		position: relative;
		padding: 1rem;
	}

	.date {
		position: absolute;
		top: -1em;
		left: 1rem;
		/* width: 14rem; */
		z-index: 1;
		background-color: var(--accent);
		border-radius: 15px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
		color: var(--white);
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
