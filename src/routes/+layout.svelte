<script lang="ts">
	import { Role } from '@prisma/client';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import './global.css';

	export let data: LayoutData;

	let menu: HTMLUListElement;
	let hamburgerCheckbox: HTMLInputElement;

	onMount(() => {
		for (const link of menu.childNodes) {
			link.addEventListener('click', () => {
				hamburgerCheckbox.checked = false;
			});
		}
	});
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"><b>MENU</b></label>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<ul id="menu" bind:this={menu}>
		<li><a href="/">Home</a></li>
		<li><a href="/schedule">Schedule</a></li>
		<li><a href="/info">Info</a></li>
		{#if data.user?.role === Role.HACKER}
			<!-- <li><a href="/id">My Hacker ID</a></li> -->
			<li><a href="/apply">Apply</a></li>
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
	nav {
		position: sticky;
		top: 0;
		margin-top: 0;
		background-color: white;
		z-index: 999;
	}

	#menu {
		display: none;
		list-style: none;
		padding: 0;
	}

	#hamburger {
		display: block;
		width: 100%;
		padding-top: 1rem;
	}

	#hamburgerCheckbox:checked + #menu {
		display: flex;
		flex-direction: column;
	}

	a {
		display: block;
		width: 100%;
		padding: 0.75rem 0;
	}

	@media (min-width: 768px) {
		#hamburger {
			display: none;
		}

		#menu {
			margin: 0;
			padding-top: 1rem;
			display: flex;
		}

		#menu li + li::before {
			content: '|';
			padding: 0.5rem;
		}

		a {
			display: inline;
			width: initial;
		}
	}

	hr {
		margin-top: 1rem;
	}
</style>
