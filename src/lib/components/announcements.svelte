<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from './markdown-editor.svelte';

	export let admin: boolean;

	export let announcements: Announcement[];
</script>

<div class="homepage-content">
	<h1>Announcements</h1>
	{#if admin}
		<form class="pad" method="POST" action="?/announce" use:enhance>
			<MarkdownEditor name="announcement" placeholder="Make an announcement here..." required />
			<button class="button-label">Announce</button>
		</form>
	{/if}
	{#if announcements.length > 0}
		<ul>
			{#each announcements as announcement}
				<li class="card">
					<span>
						<p>
							<span class="date">
								{announcement.published.toLocaleDateString('en-us', {
									month: 'long',
									day: 'numeric',
								})}
							</span>
							<span class="time">
								{announcement.published.toLocaleTimeString('en-us', {
									hour: 'numeric',
									minute: 'numeric',
								})}
							</span>
						</p>
						{#if admin}
							<form method="POST" action="?/unannounce" use:enhance>
								<input type="hidden" name="id" value={announcement.id} />
								<button class="deleteButton">✕</button>
							</form>
						{/if}
					</span>
					<div class="text">
						<SvelteMarkdown source={announcement.body} />
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="no-announcements-message">There are no announcements at this time.</p>
	{/if}
</div>

<style>
	.card {
		background: var(--primary-accent);
	}

	.button-label {
		color: #1d1d1c;
	}

	.no-announcements-message {
		text-align: center;
		font-size: 20px;
		margin-top: 20px;
		margin-bottom: 40px;
	}

	p {
		/* Styles for the entire paragraph */
		display: flex;
		align-items: center;
		font-size: 20px;
		color: var(--background-color);
		margin: 0;
		flex-grow: 1;
	}

	p span.date {
		margin-right: 10px;
	}

	p span.time {
		font-size: 10px;
		opacity: 0.6;
	}

	.pad {
		padding-top: 15px;
	}

	.text {
		color: var(--background-color);
		font-weight: 400;
	}

	ul {
		list-style: none;
		padding-left: 0;
	}

	li {
		display: flex;
		justify-content: center;
		flex-direction: column;
		background-color: #ffffff;
		padding: 1rem 2rem 2rem;
		margin-bottom: 1rem;
		margin-top: 1.5rem;
		position: relative;
	}

	span {
		display: flex;
	}

	.deleteButton {
		display: inline;
		height: initial;
		color: var(--background-color);
	}
</style>
