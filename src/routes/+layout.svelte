<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';
	import { fly } from 'svelte/transition';
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
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"
		><img src="/favicon.png" alt="Freetail logo" id="hamburger-logo" /><b>MENU</b></label
	>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<img src="/favicon.png" id="menu-logo" alt="Freetail logo" />
		<li>
			<a href="/" class:active={$page.url.pathname === '/'}>Home</a>
		</li>
		<li>
			<a href="/schedule" class:active={$page.url.pathname.startsWith('/schedule')}>Schedule</a>
		</li>
		<li><a href="/info" class:active={$page.url.pathname.startsWith('/info')}>Info</a></li>
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		{#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED')}
			<li><a href="/id" class:active={$page.url.pathname.startsWith('/id')}>My Hacker ID</a></li>
		{/if}
		{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
			<li><a href="/scan" class:active={$page.url.pathname.startsWith('/scan')}>Scan</a></li>
		{/if}
		{#if data.user?.roles.includes('HACKER')}
			<li><a href="/apply" class:active={$page.url.pathname.startsWith('/apply')}>Apply</a></li>
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
		<li>
			<a href="/feedback" class:active={$page.url.pathname.startsWith('/feedback')}>Feedback</a>
		</li>
		<li>
			<!-- Hires MLH banner -->
			<div class="show-large">
				<a
					id="mlh-trust-badge-large"
					href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=white"
					target="_blank"
					rel="noreferrer"
					><img
						src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-white.svg"
						alt="Major League Hacking 2024 Hackathon Season"
						id="mlh-badge-image"
					/></a
				>
			</div>
			<!-- Lores MLH banner -->
			<div class="show-small">
				<a
					id="mlh-trust-badge-small"
					href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=white"
					target="_blank"
					rel="noreferrer"
					><img
						src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-white.svg"
						alt="Major League Hacking 2024 Hackathon Season"
						id="mlh-badge-image"
					/></a
				>
			</div>
		</li>
	</menu>

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

<div class="main-content">
	{#key $page.url.pathname}
		<div in:fly={{ easing: cubicOut, y: 10, duration: 300 }}>
			<slot />
		</div>
	{/key}
</div>

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
	label {
		display: flex;
		font-family: 'ruddy', sans-serif;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
		color: white;
	}

	#hamburger-logo {
		display: block;
		height: 2rem;
		padding-right: 1rem;
		padding-left: 1rem;
	}

	#menu-logo {
		display: none;
	}

	.main-content {
		max-width: 50rem;
		margin: 0 auto;
		padding: 0 1rem;
	}

	nav {
		position: sticky;
		margin-top: 0;
		margin-bottom: 3rem;
		background-color: var(--primary-accent);
		z-index: 99;
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: var(--primary-accent);
		max-height: 0;
		overflow: hidden;
		width: 100%;
		font-family: 'ruddy', sans-serif;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
	}

	#hamburger {
		display: flex;
		width: 100%;
		padding-top: 0.7rem;
		padding-bottom: 0.7rem;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		flex-direction: row;
	}

	#hamburgerCheckbox:checked + menu {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	menu a {
		display: block;
		width: 100%;
		padding: 0.7rem 1rem;
		color: white;
		text-decoration: none;
	}

	menu a:hover {
		background-color: #502340;
	}

	.show-small {
		display: contents;
	}
	.show-large {
		display: none;
	}

	@media (min-width: 1090px) {
		/* minimum width that can fit all navbar tabs for admin accounts (which have the most number of tabs currently) */
		/* should be updated if we change the number of tabs */
		#hamburger-logo {
			display: none;
		}

		#menu-logo {
			display: block;
			height: 40px;
		}

		#hamburger {
			display: none;
		}

		nav {
			margin-bottom: 0.5rem;
		}

		menu {
			margin: 0;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			display: flex;
			justify-content: space-around;
			max-height: fit-content;
			align-items: center;
		}

		menu a:hover {
			border-radius: 5px;
		}

		menu a {
			display: inline;
			width: initial;
			text-decoration: none;
		}

		.show-small {
			display: none;
		}
		.show-large {
			display: contents;
		}
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999; /* Set a high z-index to ensure the overlay appears on top */
		background-color: rgba(0, 0, 0, 0.05); /* Semi-transparent background color */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.active {
		font-weight: bold;
		text-decoration: underline;
	}

	#mlh-trust-badge-large {
		display: block;
		max-width: 7rem;
		min-width: 6rem;
		position: fixed;
		right: 15px;
		top: -0.75rem;
		width: 100%;
		z-index: 10000;
	}

	#mlh-trust-badge-small {
		display: block;
		max-width: 5.5rem;
		min-width: 5.5rem;
		position: fixed;
		right: 0;
		top: -0.75rem;
		width: 100%;
		z-index: 10000;
	}

	#mlh-badge-image {
		width: 100%;
	}

	#mlh-trust-badge-large:hover,
	#mlh-trust-badge-small:hover {
		background-color: transparent;
	}
</style>
