<script lang="ts">
	import '../../routes/global.css';
	import type { Announcement } from '@prisma/client';
	import { enhance } from '$app/forms';
	import { confirmationDialog } from '$lib/actions';
	import TextEditor from './text-editor.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	interface Props {
		admin: boolean;
		announcements: Announcement[];
	}

	let { admin, announcements }: Props = $props();
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

	<form method="POST" action="?/clearAnnouncements" use:enhance>
		<button
			class="delete-button-label"
			use:confirmationDialog={{
				text: 'Are you sure you want to delete all announcements? This cannot be undone!',
				cancel: 'Cancel',
				ok: 'Delete',
			}}>Clear All Announcements</button
		>
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
			{#if admin}
				<form class="delete-message" method="POST" action="?/unannounce" use:enhance>
					<input type="hidden" name="id" value={announcement.id} />
					<button class="delete-button-label">X</button>
				</form>
			{/if}
		</li>
	{/each}
</ul>

<style>
	:root {
		--spacing: 3rem;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
	}

	.pad {
		padding: 2em 0;
	}

	ul {
		list-style: none;
		padding: 1em;
		margin: 0;
		height: 80vh;
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

	.card {
		background-color: var(--light-grey);
		border-radius: 50px;
		position: relative;
		padding: 1rem 1.5em;
	}

	.delete-message {
		position: absolute;
		right: 1em;
		top: -1em;
	}

	.delete-message button {
		padding: 0.4em 0.6em;
		border-radius: var(--border-radius);
		background: var(--red);
	}

	.delete-message button:hover {
		background: red;
		color: var(--white);
	}

	.date p {
		margin: 0;
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
