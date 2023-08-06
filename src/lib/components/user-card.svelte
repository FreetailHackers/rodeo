<script lang="ts">
	import type { Prisma, Question } from '@prisma/client';
	import SvelteMarkdown from 'svelte-markdown';

	export let user: Partial<Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }>>;
	export let questions: Question[];

	$: application = user.application as Record<string, unknown>;
</script>

<p><b>Role</b> {user.authUser?.roles.join(', ')}</p>
<p>
	<b>Status</b>
	{user.authUser?.status}
	{#if user.decision}(Pending {user.decision.status}){/if}
</p>
{#each questions as question}
	<SvelteMarkdown source={question.label} />
	{#if application[question.id] === undefined || application[question.id] === ''}
		<blockquote><i>No answer given</i></blockquote>
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
