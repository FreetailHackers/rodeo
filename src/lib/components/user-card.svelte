<script lang="ts">
	import type { Prisma, Question } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: Partial<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>>;
	export let questions: Question[];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	$: application = user.application as Record<string, any>;
</script>

<p><b>Role</b> {user.authUser?.roles.join(', ')}</p>
<p>
	<b>Status</b>
	{user.authUser?.status}
	{#if user.decision}(Pending {user.decision.status}){/if}
</p>
{#each questions as question}
	<SvelteMarkdown source={question.label} />
	{#if Array.isArray(application[question.id])}
		<blockquote>{application[question.id].join(', ')}</blockquote>
	{:else}
		<blockquote>{application[question.id]}</blockquote>
	{/if}
{/each}

<style>
	blockquote {
		background: #eee;
		padding: 0.5rem;
		border-left: none;
		border-left: #aaa 5px solid;
	}
</style>
