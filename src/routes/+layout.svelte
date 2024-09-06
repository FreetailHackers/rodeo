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
			<a href="/">About</a>
		</li>
		<li>
			<a href="/#Announcements">Announcements</a>
		</li>
		<li>
			<a href="/#Schedule">Schedule</a>
		</li>

		<li>
			<a href="/#Prizes">Prizes</a>
		</li>
		<li>
			<a href="/#FAQ">FAQ</a>
		</li>
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		{#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED')}
			<li><a href="/id">My Hacker ID</a></li>
		{/if}
		{#if data.user?.roles.includes('ORGANIZER') || data.user?.roles.includes('ADMIN')}
			<li><a href="/scan">Scan</a></li>
		{/if}
		{#if data.user?.roles.includes('HACKER')}
			<li><a href="/apply">Apply</a></li>
		{/if}
		{#if data.user?.roles.includes('ADMIN') || data.user?.roles.includes('SPONSOR')}
			<li>
				<!-- HACK: Tell SvelteKit to force refresh on /users since
				IDK how to reset the filters on the users page otherwise -->
				<a href="/users" data-sveltekit-reload>Users</a>
			</li>
			{#if data.user?.roles.includes('ADMIN')}
				<li><a href="/admin">Admin</a></li>
				<li>
					<a href="/admissions">Admissions</a>
				</li>
			{/if}
		{/if}
		<li>
			{#if data.user === undefined}
				<a class="login" href="/login">Login</a>
			{:else}
				<form method="POST" action="/logout">
					<button class="button" type="submit">Logout</button>
				</form>
			{/if}
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

<footer class="home-content">
	<div class="footer-flex">
		<div class="flex-column" id="freetailcolumn">
			<div class="bat-and-main">
				<img class="footer-bat" src="/Freetail_bat.svg" alt="freetail-bat" />
				<div>Freetail Hackers</div>
			</div>
			<a target="_blank" rel="noopener noreferrer" href="https://freetailhackers.com"
				>freetailhackers.com</a
			>
			<a
				id="freetailmail"
				target="_blank"
				rel="noopener noreferrer"
				href="mailto:admin@freetailhackers.com">admin@freetailhackers.com</a
			>
			<div>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.linkedin.com/company/freetail-hackers/"
				>
					<img class="footer-media" src="/media/linkedin.svg" alt="LinkedIn" />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.instagram.com/freetailhackers/"
				>
					<img class="footer-media" src="/media/instagram.svg" alt="Instagram" />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.facebook.com/freetailhackers/"
				>
					<img class="footer-media" src="/media/facebook.svg" alt="Facebook" />
				</a>
				<a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@freetailhackers">
					<img class="footer-media" src="/media/tiktok.svg" alt="Tiktok" />
				</a>
				<a target="_blank" rel="noopener noreferrer" href="https://x.com/freetailhackers">
					<img class="footer-media" src="/media/twitter.svg" alt="Twitter" />
				</a>
			</div>
		</div>
		<div class="flex-column">
			<div class="row category">Hacker Resources</div>
			<a target="_blank" rel="noopener noreferrer" href="#">Devpost</a>
			<a target="_blank" rel="noopener noreferrer" href="#">Discord</a>
			<a target="_blank" rel="noopener noreferrer" href="https://mlh.io/seasons/2025/events">MLH</a>
		</div>
		<div class="flex-column">
			<div class="row category">Other Resources</div>
			<a target="_blank" rel="noopener noreferrer" href="https://uhsg.freetailhackers.com/">UHSG</a>
			<a target="_blank" rel="noopener noreferrer" href="https://yearofai.utexas.edu/">Year of AI</a
			>
		</div>
		<div class="flex-column" id="right-footer-col">
			<div class="row category">Other Hackathons</div>
			<a target="_blank" rel="noopener noreferrer" href="https://tamuhack.org/"> TAMUHack</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackuta.org"> HackUTA</a>
			<a target="_blank" rel="noopener noreferrer" href="https://www.unthackathon.com/">HackUNT</a>
			<a target="_blank" rel="noopener noreferrer" href="https://rowdyhacks.org/"> RowdyHacks</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackutd.co/"> HackUTD</a>
		</div>
	</div>
	<div class="footer-copyright-flex">
		<div class="flex-column">
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf">Code of Conduct</a
			>
		</div>
		<div class="flex-column">
			<p>Copyright @ Freetail Hackers 2024</p>
		</div>
	</div>
</footer>

<style>
	.footer-media {
		margin-right: 1em;
	}

	#freetailcolumn {
		flex-basis: 16em;
	}

	.bat-and-main,
	#freetailmail {
		margin-bottom: 1em;
	}

	.bat-and-main {
		font-size: 20px;
		display: inline-flex;
		gap: 1em;
	}

	.footer-bat {
		filter: brightness(0%);
		width: 50px;
	}

	.footer-flex {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.flex-column a,
	.flex-column p {
		color: black;
		font-weight: normal;
		flex-wrap: nowrap;
	}

	.footer-copyright-flex .flex-column a,
	.footer-copyright-flex .flex-column p {
		color: lightgrey;
		margin-top: 1em;
	}

	.login {
		display: inline-block;
		padding: 10px 20px;
		font-size: 16px;
		color: #fff;
		background-color: var(--accent-color);
		border: none;
		border-radius: 10px;
		text-align: center;
		text-decoration: none;
		transition: background-color 0.3s ease;
	}

	.flex-column {
		flex-basis: 11em;
		font-weight: bold;
		display: flex;
		flex-direction: column;
	}

	#right-footer-col {
		flex-basis: auto;
	}

	.footer-copyright-flex {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		margin-top: 30px;
	}

	.footer-copyright-flex .flex-column {
		flex-basis: auto;
	}

	.footer-flex .flex-column {
		margin-top: 20px;
	}

	a {
		text-decoration: none;
	}

	button {
		color: #e1563f;
		text-decoration: none;
		line-height: 1.5;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.category {
		margin-bottom: 20px;
		font-size: 18px;
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

	button {
		background-color: red;
		text-transform: uppercase;
		font-family: 'Geologica', sans-serif;
		font-weight: 700;
	}

	nav {
		position: fixed;
		top: 0;
		margin: 0;
		width: 100vw;
		background-color: var(--secondary-color);
		z-index: 99;
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: var(--secondary-color);
		max-height: 0;
		overflow: hidden;
		width: 100%;
		font-family: 'Geologica', sans-serif;
		font-size: 15px;
		font-style: normal;
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
		font-weight: bold;
	}

	@media (max-width: 768px) {
		footer {
			padding: 0;
		}

		#right-footer-col {
			flex-basis: 200px;
		}

		.footer-flex {
			margin: 4cap;
		}

		.footer-copyright-flex .flex-column {
			width: 100%;
		}

		.footer-copyright-flex {
			margin-left: 1em;
		}
	}

	@media (max-width: 1090px) {
		.button {
			display: flex;
			width: 100%;
			padding-top: 0.3rem;
			padding-bottom: 0.7rem;
			padding-left: 1rem;
			justify-content: flex-start;
			flex-wrap: nowrap;
			flex-direction: row;
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
			padding-top: 1rem;
			padding-bottom: 1rem;
			display: flex;
			justify-content: space-around;
			max-height: fit-content;
			align-items: center;
		}

		menu a:hover,
		button:hover {
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
