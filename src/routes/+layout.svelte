<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';

	export let data;

	// Automatically display a toast if a form action returns a string
	$: if (typeof $page.form === 'string') {
		toasts.notify($page.form);
	}

	let menu: HTMLMenuElement;
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
	<menu id="menu" bind:this={menu}>
		<li><a href="/">Home</a></li>
		<li><a href="/schedule">Schedule</a></li>
		<li><a href="/info">Info</a></li>
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		{#if data.user !== null && (data.user.role !== 'HACKER' || data.user.status === 'CONFIRMED')}
			<li><a href="/id">My Hacker ID</a></li>
		{/if}
		{#if data.user?.role === 'ORGANIZER' || data.user?.role === 'ADMIN'}
			<li><a href="/scan">Scan</a></li>
		{/if}
		{#if data.user?.role === 'HACKER'}
			<li><a href="/apply">Apply</a></li>
		{:else if data.user?.role === 'ADMIN'}
			<li><a href="/users">Users</a></li>
			<li><a href="/admin">Admin</a></li>
			<li><a href="/admissions">Admissions</a></li>
		{/if}
		<li><a href="/feedback">Feedback</a></li>
	</menu>
	<hr />
</nav>

<slot />

<Toasts />

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
		z-index: 99;
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: white;
		max-height: 0;
		overflow: hidden;
		width: 100%;
	}

	#hamburger {
		display: block;
		width: 100%;
		padding-top: 1rem;
	}

	#hamburgerCheckbox:checked + menu {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	menu a {
		display: block;
		width: 100%;
		padding: 0.7rem 0;
	}

	@media (min-width: 768px) {
		#hamburger {
			display: none;
		}

		menu {
			margin: 0;
			padding-top: 1rem;
			display: flex;
			max-height: fit-content;
		}

		menu li + li::before {
			content: '|';
			padding: 0.5rem;
		}

		menu a {
			display: inline;
			width: initial;
		}
	}

	hr {
		margin-top: 1rem;
	}
</style>
