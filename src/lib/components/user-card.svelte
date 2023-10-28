<script lang="ts">
	import { page } from '$app/stores';
	import type { Prisma, Question } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: Partial<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>>;
	export let questions: Question[];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	$: application = user.application as Record<string, any>;
</script>

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
				{`${$page.url.origin}/files/${user.authUserId}/${question.id}`}</a
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
</style>
