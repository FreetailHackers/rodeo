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
		const profileLogo = document.getElementById('profile-logo');
		profileLogo?.addEventListener('click', redirectToProfile);

		const links = document.querySelectorAll('nav menu a');
		links.forEach((link) => {
			link.addEventListener('click', () => {
				// Close the menu when a link is clicked on mobile
				hamburgerCheckbox.checked = false;
			});
		});
	});

	function redirectToProfile() {
		let destinationURL;
		if (data.user !== undefined) {
			destinationURL = '/id';
		} else {
			destinationURL = '/login';
		}
		window.location.href = destinationURL;
	}

	function handleKeyPress(event: KeyboardEvent): void {
		if (event.key === 'Enter' || event.key === 'Space') {
			redirectToProfile();
		}
	}
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"
		><img
			src="navbar\Hamburger.svg"
			alt="Freetail logo"
			id="hamburger-logo"
			style="width:50px; height:20px"
		/><b>MENU</b>
		<img
			src="navbar\Profile.svg"
			alt="Profile logo"
			id="profile-logo"
			style="width:50px; height:20px"
			on:click={redirectToProfile}
			on:keypress={handleKeyPress}
		/>
	</label>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<img src="/Freetail_bat.png" id="menu-logo" alt="Freetail logo" />
		<li>
			<a href="/" class:active={$page.url.pathname === '/' && $page.url.hash === ''}
				><img src="navbar\Home.svg" alt="Home icon" class="menu-icon" />Home</a
			>
		</li>
		{#if !data.user?.roles.includes('ADMIN')}
			<li>
				<a href="/#Announcements" class:active={$page.url.hash === '#Announcements'}
					>Announcements</a
				>
			</li>
			<li>
				<a href="/#Schedule" class:active={$page.url.hash === '#Schedule'}
					><img src="navbar\Schedule.svg" alt="Schedule icon" class="menu-icon" />Schedule</a
				>
			</li>
			<li>
				<a href="/#FAQ" class:active={$page.url.hash === '#FAQ'}>FAQ</a>
			</li>
			<li>
				<a href="/#Challenges" class:active={$page.url.hash === '#Challenges'}>Challenges</a>
			</li>
			<li>
				<a href="/#Sponsors" class:active={$page.url.hash === '#Sponsors'}>Sponsors</a>
			</li>
		{/if}
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		<!-- {#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED')}
			<li><a href="/id" class:active={$page.url.pathname.startsWith('/id')}>My Hacker ID</a></li>
		{/if} -->
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

		<li id="profile-link">
			<img
				src="navbar\Profile.svg"
				alt="Profile logo"
				id="profile-logo"
				style="width:50px; height:20px"
				on:click={redirectToProfile}
				on:keypress={handleKeyPress}
			/>
		</li>
	</menu>

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#key $page.url.pathname}
	<div in:fade={{ easing: cubicOut, duration: 300 }}>
		<slot />
	</div>
{/key}

<Toasts />

<footer>
	<div class="footer-flex">
		<div class="made-with-love">
			Made with 🤍 by <a
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
	footer {
		background-color: var(--primary-accent);
	}

	.footer-flex {
		display: flex;
		justify-content: space-around;
		margin: auto;
		max-width: 75em;
		color: #f2ebd9;
	}

	.made-with-love {
		white-space: nowrap;
		align-self: center;
	}

	.freetail-link {
		color: var(--background-color);
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
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
		color: #f2ebd9;
	}

	.menu-icon {
		height: 20px;
		padding-right: 10px;
	}

	#hamburger-logo,
	#profile-logo {
		display: block;
		height: 2rem;
		padding-right: 1rem;
		padding-left: 1rem;
	}

	#profile-logo {
		margin-left: auto;
		margin-right: 1rem;
	}

	#profile-link {
		display: none;
	}

	#menu-logo {
		display: none;
	}

	nav {
		position: fixed;
		top: 0;
		margin: 0;
		width: 100vw;
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

	.active {
		font-weight: bold;
		text-decoration: underline;
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

		#profile-logo {
			margin-left: auto;
			margin-right: 1rem;
		}

		#menu-logo {
			display: block;
			height: 40px;
		}

		#hamburger {
			display: none;
		}

		#profile-link {
			display: block;
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
</style>
