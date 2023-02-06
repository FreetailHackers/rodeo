<script lang="ts">
	import { Role } from '@prisma/client';
	import type { LayoutData } from './$types';
	import './global.css';

	export let data: LayoutData;
</script>

<nav>
	<a href="/">Home</a>
	<a href="/schedule">Schedule</a>
	{#if data.user?.role === Role.HACKER}
		<a href="/apply">Apply</a>
		<a href="/id">My Hacker ID</a>
	{:else if data.user?.role === Role.ADMIN}
		<a href="users">Users</a>
		<a href="admin">Admin</a>
	{/if}
</nav>

<slot />
