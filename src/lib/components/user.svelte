<script lang="ts">
	import type { Prisma } from '@prisma/client';

	export let user: Prisma.UserGetPayload<{ include: { decision: true } }>;
</script>

<p><b>EMAIL</b> {user.email}</p>
<p><b>MAJOR</b> {user.major}</p>
<p><b>ROLE</b> {user.role}</p>
<p>
	<b>STATUS</b>
	{user.status}
	{#if user.decision}(Pending {user.decision.status}){/if}
</p>
