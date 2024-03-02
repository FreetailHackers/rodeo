<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from './markdown-editor.svelte';

	export let admin: boolean;

	export let announcements: Announcement[];
</script>

{#if admin}
	<form method="POST" action="?/announce" use:enhance class="form">
		<MarkdownEditor name="announcement" placeholder="Make an announcement here..." required />
		<br />
		<button class="announcement-button-label">Announce</button>
	</form>
{/if}
{#if announcements.length > 0}
	<ul>
		{#each announcements as announcement}
			<li>
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
				<div class="bottom-right-image" />
			</li>
		{/each}
	</ul>
{:else}
	<p class="no-announcements-message">There are no announcements at this time.</p>
{/if}

<style>
	li {
		position: relative;
	}
	.bottom-right-image {
		background-image: url('/announcement-corner.png');
		background-size: contain;
		background-position: center bottom;
		background-repeat: no-repeat;
		position: absolute;
		bottom: 0;
		right: 0;
		width: 75px;
		height: 75px;
	}
	.form {
		flex: 1 1 100%;
	}
	.announcement-button-label {
		font-weight: 500;
		font-family: 'Fugaz One';
		color: #000000;
	}
	.no-announcements-message {
		font-weight: 500;
		font-family: 'Fugaz One';
		color: #e1563f;
		text-align: center;
		font-size: 20px;
	}
	li p {
		/* Styles for the entire paragraph */
		display: flex;
		align-items: center;
	}

	li p span.date {
		font-family: 'Fugaz One';
		font-weight: 400;
		font-size: 20px;
		color: #e1563f;
		margin-right: 10px;
	}

	li p span.time {
		font-family: 'Fugaz One';
		font-weight: 400;
		font-size: 10px;
		color: #e1563f;
		opacity: 0.6;
	}

	.announcement-text {
		font-family: 'Fugaz One';
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
	}

	p {
		margin: 0;
		flex-grow: 1;
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
