<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Loader from '$lib/components/loader.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

	export let data;

	// Automatically display a toast if a form action returns a string
	$: if (typeof $page.form === 'string') {
		toasts.notify($page.form);
	}

	let menu: HTMLMenuElement;
	let hamburgerCheckbox: HTMLInputElement;
	let isLoading = false;
	beforeNavigate(() => (isLoading = true));
	afterNavigate(() => (isLoading = false));

	onMount(() => {
		for (const link of menu.childNodes) {
			link.addEventListener('click', () => {
				// Close the menu when a link is clicked on mobile
				hamburgerCheckbox.checked = false;
			});
		}
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
	<div class="navbar">
		<label for="hamburgerCheckbox"
			><img draggable="false" src="/auth-assets/bat.svg" alt="burger-menu" id="hamburger-logo" />
			<img draggable="false" src="/burger_Menu.png" alt="burger-menu" id="hamburger-logo" /></label
		>
		<input
			type="checkbox"
			id="hamburgerCheckbox"
			bind:this={hamburgerCheckbox}
			style="display: none"
		/>
		<menu id="menu" bind:this={menu}>
			<li><a href="https://hacktx.com/">Homepage</a></li>
			<li><a href="/">Announcements</a></li>
			{#if data.user?.roles.includes('HACKER')}
				<li>
					<a href="/apply" class:active={$page.url.pathname.startsWith('/apply')}> Application</a>
				</li>
			{/if}
			{#if data.user?.roles.includes('ADMIN') || data.user?.roles.includes('SPONSOR')}
				<li>
					<!-- HACK: Tell SvelteKit to force refresh on /users since
				IDK how to reset the filters on the users page otherwise -->
					<a
						href="/users"
						class:active={$page.url.pathname.startsWith('/users')}
						data-sveltekit-reload>Users</a
					>
				</li>
				{#if data.user?.roles.includes('ADMIN')}
					<li><a href="/admin" class:active={$page.url.pathname.startsWith('/admin')}>Admin</a></li>
					<li>
						<a href="/admissions" class:active={$page.url.pathname.startsWith('/admissions')}
							>Admissions</a
						>
					</li>
				{/if}
			{/if}

			{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
				<li><a href="/scan" class:active={$page.url.pathname.startsWith('/scan')}>Scan</a></li>
			{/if}
			<li>
				<a href="/account" class:active={$page.url.pathname.startsWith('/account')}> Account</a>
			</li>
			<li>
				<a href="/settings" class:active={$page.url.pathname.startsWith('/settings')}>Settings</a>
			</li>
			<li>
				<form method="POST" action="/logout">
					<button type="submit">Logout</button>
				</form>
			</li></menu
		>

		{#if isLoading}
			<div class="overlay">
				<Loader />
			</div>
		{/if}
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
	.container {
		margin-left: 16rem;
	}

	.navbar {
		width: 16rem;
		height: 100vh;
		position: fixed;
		top: 0;
		margin: 0;
		background-color: var(--background-grey);
		z-index: 10;
	}

	.navbar label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1em 1.5em;
	}

	#hamburger-logo {
		display: none;
	}

	.navbar menu {
		list-style: none;
		padding: 0;
		margin: 0;
		overflow: clip;
		transition: max-height 0.4s ease-in-out;
	}

	.navbar a,
	.navbar form button {
		text-decoration: none;
		color: var(--black);
		display: block;
		padding: 1.5em 2em;
		background-color: unset;
		text-align: left;
		transition: all 0.2s;
	}

	.navbar a:hover,
	.navbar form button:hover {
		background-color: var(--white);
		font-weight: normal;
	}

	.navbar a:active {
		background-color: var(--white);
		font-weight: bold;
	}

	@media (max-width: 780px) {
		.container {
			margin-top: 5em;
			margin-left: 0;
		}

		.navbar {
			width: 100vw;
			height: unset;
		}

		#hamburger-logo {
			height: 2rem;
			width: 2rem;
			display: block;
			user-select: none;
			filter: brightness(0);
		}

		/* Close hamburger menu */
		menu {
			max-height: 0;
		}

		/* Opens hamburger menu when clicked */
		#hamburgerCheckbox:checked + menu {
			max-height: 100vh;
		}

		.navbar a,
		.navbar form button {
			padding: 0.5em 2em;
		}
	}
</style>
