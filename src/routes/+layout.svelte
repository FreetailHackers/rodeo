<script lang="ts">
	import type { LayoutData } from './$types';
	import './global.css';

	export let data: LayoutData;
</script>

<nav>
	<a href="/">Home</a>
	<a href="/schedule">Schedule</a>
	{#if data.authenticated}
		<a href="/apply">Apply</a>
		<a href="/help">Help Queue</a>
		<a href="/team">Team Matching</a>
		<a href="/id">My Hacker ID</a>
	{/if}
</nav>

<slot />
