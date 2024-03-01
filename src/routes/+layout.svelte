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
			<a href="/" class:active={$page.url.pathname === '/'}>Home</a>
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
		<li>
			<a href="/feedback" class:active={$page.url.pathname.startsWith('/feedback')}>Feedback</a>
		</li>
	</menu>

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#key $page.url.pathname}
	<!-- <div in:fly={{ easing: cubicOut, y: -100, duration: 300 }}> -->
	<slot />
	<!-- </div> -->
{/key}

<Toasts />

<footer>
	<hr />
	<div class="flex-container">
		<div class="flex-item">
			Made with ❤️ by <a
				target="_blank"
				rel="noopener noreferrer"
				href="https://freetailhackers.com"
			>
				Freetail Hackers</a
			>
		</div>
		<div class="flex-item">
			<div class="row bold">Links</div>
			<div class="row">
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.instagram.com/freetailhackers?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
				>
					Instagram</a
				>
			</div>
			<div class="row">
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.linkedin.com/company/freetail-hackers"
				>
					LinkedIn</a
				>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com/discord">
					Discord</a
				>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://linktr.ee/freetailhackers">
					LinkTree</a
				>
			</div>
		</div>
		<div class="flex-item">
			<div class="row bold">Other Hackathons</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://rowdyhacks.org/"> RowdyHacks</a>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://tamuhack.org/"> TAMU hack</a>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://hackutd.co/"> HackUTD</a>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://www.unthackathon.com/">
					HackUNT</a
				>
			</div>
			<div class="row">
				<a target="_blank" rel="noopener noreferrer" href="https://hackuta.org/"> HackUTA</a>
			</div>
		</div>
	</div>
</footer>

<style>
	.flex-container {
		display: flex;
		align-items: center;
	}

	.flex-item {
		flex: 1; /* Makes each item (column) grow equally to fill the container */
		padding: 10px; /* Optional padding */
		/* color: white; */
	}

	.bold {
		font-weight: bold;
	}

	a {
		/* color: white; */
	}

	label {
		display: flex;
		font-family: 'Geologica Medium', sans-serif;
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

	nav {
		position: sticky;
		top: 0;
		margin: 0;
		background-color: var(--primary-accent);
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
		font-family: 'Geologica Medium', sans-serif;
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
		color: white;
		text-decoration: none;
	}

	menu a:hover {
		background-color: #502340;
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

		/* nav {
			margin-bottom: 0;
		} */
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
