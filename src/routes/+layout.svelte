<script lang="ts">
	import { Role } from '@prisma/client';
	import type { LayoutData } from './$types';
	import './global.css';

	export let data: LayoutData;

	// @ts-ignore
	const release = __RELEASE__;
	// @ts-ignore
	const build = __BUILD__;
	// @ts-ignore
	const timestamp = __TIMESTAMP__;
</script>

<nav>
	<a href="/">Home</a>
	<a href="/schedule">Schedule</a>
	{#if data.user?.role === Role.HACKER}
		<a href="/apply">Apply</a>
		<!-- <a href="/id">My Hacker ID</a> -->
	{:else if data.user?.role === Role.ADMIN}
		<a href="users">Users</a>
		<a href="admin">Admin</a>
		<a href="admissions">Admissions</a>
	{/if}
</nav>

<slot />

<footer>
	<hr />
	<p>
		Made with ❤️ by <a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com">
			Freetail Hackers
		</a>
	</p>
	<p>Release {release} ({build}) @ {timestamp}</p>
</footer>

<style>
	hr {
		margin-top: 1rem;
	}
</style>
