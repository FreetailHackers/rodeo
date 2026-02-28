<script lang="ts">
	import { page } from '$app/state';
	import type { Prisma, Question } from '@prisma/client';
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import { trpc } from '$lib/trpc/client';
	import { invalidateAll } from '$app/navigation';

	interface Props {
		user: Partial<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>>;
		questions: Question[];
		teammates?: { email: string; status: string }[];
	}

	let { user, questions, teammates = [] }: Props = $props();

	let application = $derived(user.application as Record<string, any>);

	async function toggleTag(tag: 'isOOS' | 'isnonUT') {
		const newValue = !user[tag];
		try {
			await trpc(page).users.updateAdminTags.mutate({
				userId: user.authUserId!,
				tag: tag,
				value: newValue,
			});
			// Update local state so UI reflects the change
			user[tag] = newValue;
		} catch (e) {
			console.error(`Failed to toggle ${tag}:`, e);
		}
	}
</script>

<!-- Ensures the teammate list is only displayed if the user is not the only person on the team -->
{#if teammates.length > 1}
	<p><b>Teammates</b></p>
	<ul class="teammates-list">
		{#each teammates as { email, status }}
			{#if user.authUser?.email !== email}
				<li>
					<span class="email">{email}</span>
					<span class="status">({status})</span>
				</li>
			{/if}
		{/each}
	</ul>
{/if}

<div class="admin-tags">
	<label>
		<input type="checkbox" checked={user.isOOS} onchange={() => toggleTag('isOOS')} />
		<b>Out of State</b>
	</label>
	<label>
		<input type="checkbox" checked={user.isnonUT} onchange={() => toggleTag('isnonUT')} />
		<b>Non-UT</b>
	</label>
</div>

<hr />

<p><b>Verified Email</b> {user.authUser?.verifiedEmail}</p>
<p><b>Role</b> {user.authUser?.roles.join(', ')}</p>
<p>
	<b>Status</b>
	{user.authUser?.status}
	{#if user.decision}(Pending {user.decision.status}){/if}
</p>
{#each questions as question}
	<SvelteMarkdown source={question.label} />
	<blockquote>
		{#if application[question.id] === undefined || application[question.id] === ''}
			<i>No answer given</i>
		{:else if question.type === 'FILE'}
			<a
				href={`/files/${user.authUserId}/${question.id}`}
				target="_blank"
				rel="noopener noreferrer"
			>
				{`${page.url.origin}/files/${user.authUserId}/${question.id}`}</a
			>
		{:else if Array.isArray(application[question.id])}
			{application[question.id].join(', ')}
		{:else}
			{application[question.id]}{/if}
	</blockquote>
{/each}

<style>
	blockquote {
		background: #eee;
		padding: 0.5rem;
		border-left: none;
		border-left: #aaa 5px solid;
	}

	span {
		color: var(--accent); /* changed for dark mode */
	}
</style>
