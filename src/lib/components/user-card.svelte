<script lang="ts">
	import type { Prisma, Question } from '@prisma/client';

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
	<p><b>{question.label}</b> {application[question.id]}</p>
{/each}
