<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Announcement } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let admin: boolean;

	export let announcements: Announcement[];
</script>

{#if admin}
	<form method="POST" action="?/announce" use:enhance>
		<textarea name="announcement" placeholder="Make an announcement here..." required />
		<button>Announce</button>
	</form>
	<br />
{/if}
{#if announcements.length > 0}
	<ul>
		{#each announcements as announcement}
			<li>
				<span>
					<p>
						{announcement.published.toLocaleTimeString('en-us', {
							hour: 'numeric',
							minute: 'numeric',
						})}
						on
						{announcement.published.toLocaleDateString('en-us', {
							month: 'long',
							day: 'numeric',
						})}
					</p>
					{#if admin}
						<form method="POST" action="?/unannounce" use:enhance>
							<input type="hidden" name="id" value={announcement.id} />
							<button class="deleteButton">✕</button>
						</form>
					{/if}
				</span>
				<br />
				<p><SvelteMarkdown source={announcement.body} isInline /></p>
			</li>
		{/each}
	</ul>
{:else}
	<p>There are no announcements at this time.</p>
{/if}

<style>
	ul {
		list-style: none;
		padding-left: 0;
	}

	li {
		border: 2px solid black;
		padding: 1rem;
		margin-bottom: 1rem;
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
