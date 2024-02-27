<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';
	import MarkdownEditor from './markdown-editor.svelte';

	export let admin: boolean;

	export let announcements: Announcement[];
</script>

{#if admin}
	<form method="POST" action="?/announce" use:enhance>
		<MarkdownEditor name="announcement" placeholder="Make an announcement here..." required />
		<br />
		<button>Announce</button>
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
			</li>
		{/each}
	</ul>
{:else}
	<p>There are no announcements at this time.</p>
{/if}

<style>


	li p{
    	/* Styles for the entire paragraph */
    	display: flex;
    	align-items: center; 
	}

	li p span.date {
		font-family: 'Fugaz One';
		font-weight: 400;
		font-size: 20px;
        color: #E1563F;
		margin-right: 10px; 
	}

	li p span.time {
		font-family: 'Fugaz One';
		font-weight: 400;
		font-size: 10px;
        color: #E1563F; 
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
		background-image: url('announcement-images/announcement-item.png');
    	background-size: cover; /* or contain */
		padding: 1rem 2rem 2rem; /* Adjust padding as needed */
		margin-bottom: 1rem; /* Adjust margin as needed */
		margin-top: 1rem; /* Adjust margin as needed */
		background-position: right bottom;
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
