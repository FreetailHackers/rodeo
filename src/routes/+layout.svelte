<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	// import Loader from '$lib/components/loader.svelte';
	// import { beforeNavigate, afterNavigate } from '$app/navigation';

	export let data;

	// Automatically display a toast if a form action returns a string
	$: if (typeof $page.form === 'string') {
		toasts.notify($page.form);
	}

	// let menu: HTMLMenuElement;
	// let hamburgerCheckbox: HTMLInputElement;
	// let isLoading = false;
	// beforeNavigate(() => (isLoading = true));
	// afterNavigate(() => (isLoading = false));

	onMount(() => {
		// for (const link of menu.childNodes) {
		// 	link.addEventListener('click', () => {
		// 		// Close the menu when a link is clicked on mobile
		// 		hamburgerCheckbox.checked = false;
		// 	});
		// }
	});

	const noLayoutRoutes = ['/login', '/register']; // Routes that shouldn't have layout
</script>

{#if data.user?.roles.includes('ADMIN') || data.user?.roles.includes('SPONSOR')}
	<li>
		<!-- HACK: Tell SvelteKit to force refresh on /users since
	IDK how to reset the filters on the users page otherwise -->
		<a href="/users" data-sveltekit-reload>Users</a>
	</li>
{/if}

{#if !noLayoutRoutes.some((route) => $page.url.pathname.startsWith(route))}
	<div class="sidebar">
		<ul class="sidebar-menu">
			<li><a href="https://hacktx.com/">HackTX</a></li>
			{#if data.user?.roles.includes('HACKER')}
				<li><a href="/apply">My Application</a></li>
			{/if}
			{#if data.user?.roles.includes('ADMIN')}
				<li><a href="/admin">Admin</a></li>
				<li>
					<a href="/admissions">Admissions</a>
				</li>
			{/if}
			{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
				<li><a href="/scan">Scan</a></li>
			{/if}
			{#if data.user?.roles.includes('HACKER')}
				<li><a href="/account">My Account</a></li>
			{/if}
			<li><a href="/settings">Settings</a></li>
			<li>
				<form method="POST" action="/logout">
					<button class="button" type="submit">Logout</button>
				</form>
			</li>
		</ul>
	</div>
{/if}

{#key $page.url.pathname}
	<div
		class:container={!noLayoutRoutes.some((route) => $page.url.pathname.startsWith(route))}
		in:fade={{ easing: cubicOut, duration: 300 }}
	>
		<slot />
	</div>
{/key}
<!-- No layout for /login or /register and their children -->
<Toasts />

<style>
	.sidebar-menu li form button {
		all: unset;
	}

	.container {
		margin-left: 16rem;
	}

	.sidebar {
		width: 16rem;
		height: 100vh;
		background-color: #f0f0f0;
		position: fixed;
		top: 0;
		left: 0;
		box-sizing: border-box;
	}

	.sidebar-menu {
		list-style: none;
		padding: 5rem 0;
	}

	.sidebar-menu li a,
	.sidebar-menu li form button {
		text-decoration: none;
		color: black;
		font-size: 1em;
		padding: 10px;
		display: block;
		width: 100%;
		background-color: #f0f0f0;
		transition: background-color 0.3s, font-weight 0.3s;
		box-sizing: border-box;
		padding: 1.5em 2em;
	}

	.sidebar-menu li a:hover,
	.sidebar-menu li form button:hover {
		background-color: white;
		font-weight: normal;
	}

	.sidebar-menu li a:active {
		background-color: white;
		font-weight: bold;
	}
</style>
