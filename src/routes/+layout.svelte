<script lang="ts">
	import { page } from '$app/state';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import './global.css';
	import { invalidateAll } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Loader from '$lib/components/loader.svelte';
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation';

	let { data, children } = $props();

	// Automatically display a toast if a form action returns a string
	$effect(() => {
		if (typeof page.form === 'string') {
			toasts.notify(page.form);
		}
	});

	let menu = $state() as HTMLMenuElement;
	let hamburgerCheckbox = $state() as HTMLInputElement;
	let isLoading = $state(false);
	beforeNavigate(() => (isLoading = true));
	afterNavigate(() => (isLoading = false));

	const noLayoutRoutes = ['/login', '/register', '/unverified']; // Routes that shouldn't have layout

	$effect(() => {
		if (menu && menu.childNodes) {
			for (const link of menu.childNodes) {
				if (link) {
					link.addEventListener('click', () => {
						// Close the menu when a link is clicked on mobile
						hamburgerCheckbox.checked = false;
					});
				}
			}
		}
	});
</script>

{#if !noLayoutRoutes.some((route) => page.url.pathname.startsWith(route))}
	<div class="navbar">
		<label for="hamburgerCheckbox"
			><img
				draggable="false"
				src="/auth-assets/hacktxlogo.png"
				alt="burger-menu"
				id="hamburger-logo"
			/>
			<img draggable="false" src="/burger_Menu.png" alt="burger-menu" id="hamburger-logo" /></label
		>
		<input
			type="checkbox"
			id="hamburgerCheckbox"
			bind:this={hamburgerCheckbox}
			style="display: none"
		/>
		<menu id="menu" bind:this={menu}>
			<li><a href="https://hacktx.com">Homepage</a></li>
			<li><a href="/">Announcements</a></li>
			{#if !data.user?.roles.includes('ADMIN')}
				<li>
					<a href="/apply" class:active={page.url.pathname.startsWith('/apply')}> Application</a>
				</li>
			{/if}
			{#if data.user?.roles.includes('ADMIN') || data.user?.roles.includes('SPONSOR')}
				<li>
					<a href="/users" class:active={page.url.pathname.startsWith('/users')}>Users</a>
				</li>
				{#if data.user?.roles.includes('ADMIN')}
					<li><a href="/admin" class:active={page.url.pathname.startsWith('/admin')}>Admin</a></li>
					<li>
						<a href="/admissions" class:active={page.url.pathname.startsWith('/admissions')}
							>Admissions</a
						>
					</li>
				{/if}
			{/if}

			{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
				<li><a href="/scan" class:active={page.url.pathname.startsWith('/scan')}>Scan</a></li>
			{/if}
			<li>
				<a href="/account" class:active={page.url.pathname.startsWith('/account')}>Account</a>
			</li>
			<li>
				<form method="POST" action="/logout">
					<button type="submit">Logout</button>
				</form>
			</li></menu
		>
	</div>
{/if}

{#key page.url.pathname}
	<div
		class:container={!noLayoutRoutes.some((route) => page.url.pathname.startsWith(route))}
		in:fade|global={{ easing: cubicOut, duration: 300 }}
	>
		{@render children()}
	</div>
{/key}
<!-- No layout for /login or /register and their children -->
<Toasts />

{#if isLoading}
	<div class="overlay">
		<Loader />
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		top: 0;
		width: 100vw;
		height: 100vh;
		backdrop-filter: blur(2px) brightness(0.9);
		z-index: 200;
		background-color: var(--background); /* changed for dark mode */
	}

	.container {
		margin-left: 16rem;
	}

	.navbar {
		width: 16rem;
		height: 100vh;
		position: fixed;
		top: 0;
		margin: 0;
		background-color: var(--background); /* changed for dark mode */
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
		color: var(--white);
		display: block;
		padding: 1.5em 2em;
		background-color: unset;
		text-align: left;
		transition: all 0.2s;
	}

	.navbar a:hover,
	.navbar form button:hover {
		background-color: var(--light-background);
		font-weight: normal;
	}

	.navbar a:active {
		background-color: var(--light-background);
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
			/* filter: brightness(0); */ /* changed for dark mode */
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
