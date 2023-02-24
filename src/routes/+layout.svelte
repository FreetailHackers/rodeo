<script lang="ts">
	import { Role } from '@prisma/client';
	import type { LayoutData } from './$types';
	import './global.css';

	export let data: LayoutData;
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger">Menu</label>
	<input type="checkbox" id="hamburgerCheckbox" style="display: none" />
	<ul id="menu">
		<li><a href="/">Home</a></li>
		<li><a href="/schedule">Schedule</a></li>
		<li><a href="/info">Info</a></li>
		{#if data.user?.role === Role.HACKER}
			<li><a href="/apply">Apply</a></li>
			<!-- <li><a href="/id">My Hacker ID</a></li> -->
		{:else if data.user?.role === Role.ADMIN}
			<li><a href="/users">Users</a></li>
			<li><a href="/admin">Admin</a></li>
			<li><a href="/admissions">Admissions</a></li>
		{/if}
	</ul>
	<hr />
</nav>

<slot />

<footer>
	<hr />
	<p>
		Made with ❤️ by <a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com">
			Freetail Hackers
		</a>
	</p>
</footer>

<style>
	#menu {
		display: none;
		list-style: none;
		padding: 0;
	}

	#hamburger {
		display: block;
		width: 100%;
	}

	#hamburgerCheckbox:checked + #menu {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (min-width: 768px) {
		#hamburger {
			display: none;
		}

		#menu {
			display: flex;
		}

		#menu li + li::before {
			content: '|';
			padding: 0.5rem;
		}
	}

	hr {
		margin-top: 1rem;
	}
</style>
