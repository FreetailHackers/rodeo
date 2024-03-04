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
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"
		><img
			src="/burger_Menu.png"
			alt="Freetail logo"
			id="hamburger-logo"
			style="width:50px; height:20px"
		/><b>MENU</b></label
	>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<img src="/Freetail_bat.png" id="menu-logo" alt="Freetail logo" />
		<li>
			<a href="/" class:active={$page.url.pathname === '/' && $page.url.hash === ''}>Home</a>
		</li>
		<li>
			<a href="/#Announcements" class={$page.url.hash === '#Announcements' ? 'active' : ''}
				>Announcements</a
			>
		</li>
		<li>
			<a href="/#Schedule" class={$page.url.hash === '#Schedule' ? 'active' : ''}>Schedule</a>
		</li>
		<li>
			<a href="/#Sponsors" class={$page.url.hash === '#Sponsors' ? 'active' : ''}>Sponsors</a>
		</li>

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
	</menu>

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#if $page.url.pathname === '/'}
	<a
		id="mlh-trust-badge"
		href="https://mlh.io/na?utm_source=na-hackathon&utm_medium=TrustBadge&utm_campaign=2024-season&utm_content=red"
		target="_blank"
		rel="noreferrer"
		><img
			src="https://s3.amazonaws.com/logged-assets/trust-badge/2024/mlh-trust-badge-2024-red.svg"
			alt="Major League Hacking 2024 Hackathon Season"
			id="mlh-badge-image"
		/></a
	>
{/if}

{#key $page.url.pathname}
	<div in:fade={{ easing: cubicOut, duration: 300 }}>
		<slot />
	</div>
{/key}

<Toasts />

<footer>
	<div class="footer-flex">
		<div class="made-with-love">
			Made with ❤️ by <a
				class="freetail-link"
				target="_blank"
				rel="noopener noreferrer"
				href="https://freetailhackers.com">Freetail Hackers</a
			>
		</div>
		<div class="flex-column">
			<div class="row category">Links</div>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.instagram.com/freetailhackers?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
				>Instagram</a
			>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://www.linkedin.com/company/freetail-hackers">LinkedIn</a
			>
			<a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com/discord"
				>Discord</a
			>
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://docs.google.com/forms/d/e/1FAIpQLSdQld-vgVLXOuIXIcUNpTFMwii_7Cu9Vqj7CVxXs3ScFsCIrg/viewform?usp=sf_link"
				>Feedback</a
			>
			<a href="mailto:admin@freetailhackers.com">Contact Us</a>
		</div>
		<div class="flex-column">
			<div class="row category">Other Hackathons</div>
			<a target="_blank" rel="noopener noreferrer" href="https://rowdyhacks.org/"> RowdyHacks</a>
			<a target="_blank" rel="noopener noreferrer" href="https://tamuhack.org/"> TAMUhack</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackutd.co/"> HackUTD</a>
			<a target="_blank" rel="noopener noreferrer" href="https://www.unthackathon.com/">HackUNT</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackuta.org"> HackUTA</a>
		</div>
	</div>
</footer>

<style>
	#mlh-trust-badge {
		display: block;
		max-width: 5.5rem;
		min-width: 5.5rem;
		position: absolute;
		right: 15px;
		top: 2.25rem;
		width: 100%;
		z-index: 1;
	}

	#mlh-badge-image {
		width: 100%;
	}

	footer {
		background-color: #404040;
	}

	.footer-flex {
		display: flex;
		justify-content: space-around;
		margin: auto;
		max-width: 75em;
		color: #f2ebd9;
	}

	.made-with-love {
		align-self: center;
	}

	.freetail-link {
		color: #e1563f;
		text-decoration: underline;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	a {
		color: #f2ebd9;
		text-decoration: none;
		line-height: 1.5;
	}

	a:hover {
		text-decoration-line: underline;
		text-decoration-color: var(--primary-accent);
		color: var(--primary-accent);
	}

	.category {
		font-size: 17px;
	}

	label {
		display: flex;
		font-family: 'Geologica', sans-serif;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
		color: #f2ebd9;
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

	nav {
		position: fixed;
		top: 0;
		margin: 0;
		width: 100vw;
		background-color: #404040;
		z-index: 99;
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: #404040;
		max-height: 0;
		overflow: hidden;
		width: 100%;
		font-family: 'Geologica', sans-serif;
		font-size: 15px;
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
		color: #f2ebd9;
		text-decoration: none;
	}

	menu a:hover {
		background-color: #303030;
	}

	@media (max-width: 768px) {
		.flex-column {
			display: none;
		}

		.footer-flex {
			max-width: 60vw;
		}
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

		#mlh-trust-badge {
			max-width: 6rem;
			min-width: 5rem;
			top: 3.25rem;
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
</style>
