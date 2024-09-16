<script lang="ts">
	import '../../routes/global.css';
	import type { Announcement } from '@prisma/client';
	import { enhance } from '$app/forms';
	import TextEditor from './text-editor.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	export let admin: boolean;

	export let announcements: Announcement[];
</script>

<h1>Announcements</h1>
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
		<li class="card text">
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

			<SvelteMarkdown source={announcement.body} />
		</li>
	{/each}
</ul>

<style>
	:root {
		--spacing: 3rem;
	}

	h1 {
		text-align: center;
	}

	.pad {
		padding: 2em 0;
	}

	ul {
		list-style: none;
		padding: 1em;
		margin: 0;
		height: 70vh;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
		mask-image: linear-gradient(to bottom, black calc(100% - 5em), transparent 100%);
	}

	li {
		margin-top: 2em;
		scroll-snap-align: start;
		scroll-margin-top: 2em;
	}

	li:last-child {
		margin-bottom: 5em;
	}

	p {
		margin: 0;
	}

	.card {
		background-color: var(--light-grey);
		border-radius: 50px;
		position: relative;
		padding: 1rem;
	}

	.date {
		position: absolute;
		top: -1em;
		left: 1rem;
		background-color: var(--accent);
		color: var(--white);
		border-radius: var(--border-radius);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1em;
		padding: 0.3rem 1rem;
	}

	.month-day {
		display: flex;
		align-items: center;
		white-space: nowrap;
	}

	.time {
		font-size: small;
		white-space: nowrap;
	}
</style>
