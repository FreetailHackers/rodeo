<script lang="ts">
	import type { Prisma, Question } from '@prisma/client';
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: Partial<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>>;
	export let questions: Question[];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const application = user.application as Record<string, any>;

	let origin = '';
	onMount(() => {
		origin = location.origin;
	});
</script>

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
				{`${origin}/files/${user.authUserId}/${question.id}`}</a
			>
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
