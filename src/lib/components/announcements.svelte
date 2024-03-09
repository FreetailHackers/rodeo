<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from './markdown-editor.svelte';

	export let admin: boolean;

	export let announcements: Announcement[];
</script>

<div class="bg-img">
	<div class="announcement-container">
		<h1 class="announcementHeader">ANNOUNCEMENTS</h1>
		{#if admin}
			<form class="pad" method="POST" action="?/announce" use:enhance>
				<MarkdownEditor
					name="announcement"
					placeholder="Make an announcement here..."
					required
					useAnnouncementFont={true}
				/>
				<button class="announcement-button-label">Announce</button>
			</form>
		{/if}
		{#if announcements.length > 0}
			<ul>
				{#each announcements as announcement}
					<li class="announcement-card">
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
						<div class="announcement-text">
							<SvelteMarkdown source={announcement.body} />
						</div>
						<!-- Corner piece -->
						<div class="bottom-right-image">
							<svg id="triangle" viewBox="0 0 100 100">
								<polygon points="101 30, 101 101, 0 101" fill="#1c1c1c" />
							</svg>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="no-announcements-message">There are no announcements at this time.</p>
		{/if}
	</div>
</div>

<style>
	.announcement-card {
		background: ivory;
	}

	.announcement-container {
		padding: 20px;
		max-width: 75rem;
		margin: auto;
		font-family: 'Fugaz One';
		color: #e1563f;
	}

	.bg-img {
		background-color: #1c1c1c;
	}

	.announcementHeader {
		text-align: center;
		font-size: clamp(1rem, 6vw, 5rem);
		font-weight: 400;
		text-shadow: 0 4px 12px black;
		margin: 0 auto;
	}

	.bottom-right-image {
		background-size: contain;
		background-position: center bottom;
		background-repeat: no-repeat;
		position: absolute;
		bottom: 0;
		right: 0;
		width: 75px;
		height: 75px;
	}
	.announcement-button-label {
		color: #1d1d1c;
		font-family: 'Fugaz One';
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
		color: #e1563f;
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

	.announcement-text {
		font-family: 'Fugaz One';
		color: #1d1d1c;
		font-weight: 400;
		margin-top: -10px;
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
		background-color: transparent;
		color: gray;
	}
</style>
