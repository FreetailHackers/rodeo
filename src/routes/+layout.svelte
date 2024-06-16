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
			style="width:40px; height:40px; margin: 0 8px 0 28px"
		/>
		<img
			src="navbar\Profile.svg"
			alt="Profile logo"
			id="profile-logo"
			style="width:48x; height:48px; margin-right: 28px"
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
					><img
						src="navbar\Announcements.svg"
						alt="Announcements Icon"
						class="menu-icon"
					/>Announcements</a
				>
			</li>
			<li>
				<a href="/#Schedule" class:active={$page.url.hash === '#Schedule'}
					><img src="navbar\Schedule.svg" alt="Schedule icon" class="menu-icon" />Schedule</a
				>
			</li>
			<li>
				<a href="/#FAQ" class:active={$page.url.hash === '#FAQ'}
					><img src="navbar\FAQ.svg" alt="FAQ icon" class="menu-icon" />FAQ</a
				>
			</li>
			<li>
				<a href="/#Challenges" class:active={$page.url.hash === '#Challenges'}
					><img src="navbar\Challenges.svg" alt="Challenges icon" class="menu-icon" />Challenges</a
				>
			</li>
			<li>
				<a href="/#Sponsors" class:active={$page.url.hash === '#Sponsors'}
					><img src="navbar\Sponsors.svg" alt="Sponsors icon" class="menu-icon" />Sponsors</a
				>
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
				style="width:40px; height:40px; cursor: pointer;"
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
	a {
		color: var(--alt-text-color);
		text-decoration: none;
		line-height: 1.5;
	}

	a:hover {
		text-decoration-line: underline;
		/* text-decoration-color: var(--primary-accent); */
		/* color: var(--primary-accent); */
	}

	.category {
		font-size: 17px;
	}

	label {
		display: flex;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
		color: var(--secondary-text-color);
	}

	.menu-icon {
		height: 26px;
		width: 26px;
		margin-right: 16px;
		display: inline;
	}

	#hamburger {
		display: none;
	}

	#menu-logo {
		display: none;
		display: block;
		height: 40px;
	}

	nav {
		position: fixed;
		top: 0;
		margin: 0;
		width: 100vw;
		background: var(--gradient);
		color: var(--secondary-text-color);
		z-index: 99;
	}

	menu {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		margin: 0;
		padding: 0;

		list-style: none;

		transition: all 0.5s ease-out;
		background: var(--gradient);
		overflow: hidden;
		font-size: 15px;
		font-weight: 700;
		font-style: normal;
		text-transform: uppercase;
	}

	menu li {
		position: relative;
		margin: 4px 0;
	}

	menu a {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0.7rem 1rem;
		text-decoration: none;
	}

	menu a:hover {
		background-color: var(--secondary-accent);
		border-radius: 5px;
	}

	.active {
		font-weight: bold;
		text-decoration: underline;
	}

	footer {
		background: var(--gradient);
		color: var(--secondary-text-color);
		text-align: left;
		padding: 1em;
	}

	.footer-flex {
		display: flex;
		justify-content: space-around;
		margin: auto;
		max-width: 75em;
	}

	.made-with-love {
		white-space: nowrap;
		align-self: center;
	}

	.freetail-link {
		color: var(--secondary-accent);
		text-decoration: underline;
	}

	.flex-column {
		display: flex;
		flex-direction: column;
		font-size: 14px;
	}

	@media (max-width: 1200px) {
		menu {
			flex-direction: column;
			align-items: normal;
			display: none;
		}

		menu a {
			padding-left: 2rem;
		}

		#menu-logo {
			display: none;
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

		#hamburger-logo,
		#profile-logo {
			display: block;
			filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4));
		}

		#profile-logo {
			margin-left: auto;
		}
		#profile-link {
			display: none;
		}

		#hamburgerCheckbox:checked + menu {
			display: flex;
			flex-direction: column;
			max-height: 100vh;
		}

		menu li:before {
			content: '';
			background-color: var(--secondary-text-color);
			position: absolute;
			top: -4px;
			left: 24px;
			height: 1px;
			width: calc(100% - 48px);
		}

		.flex-column {
			display: none;
		}

		.footer-flex {
			max-width: 60vw;
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
