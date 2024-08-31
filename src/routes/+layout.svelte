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

<footer>
	<div class="footer-flex">
		<div class="flex-column" id="freetailcolumn">
			<div class="bat-and-main">
				<img class="footer-bat" src="/Freetail_bat.png" alt="freetail-bat" />
				<div>Freetail Hackers</div>
			</div>
			<a
				class="freetail-link"
				target="_blank"
				rel="noopener noreferrer"
				href="https://freetailhackers.com">freetailhackers.com</a
			>
			<a
				id="freetailmail"
				class="freetail-link"
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
					<img height="30px" width="auto" src="/media/linkedin.png" alt="media" />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.instagram.com/freetailhackers/"
				>
					<img height="30px" width="auto" src="/media/instagram.png" alt="media" />
				</a>
				<a
					target="_blank"
					rel="noopener noreferrer"
					href="https://www.facebook.com/freetailhackers/"
				>
					<img height="30px" width="auto" src="/media/facebook.png" alt="media" />
				</a>
				<a target="_blank" rel="noopener noreferrer" href="https://www.tiktok.com/@freetailhackers">
					<img height="30px" width="auto" src="/media/tiktok.png" alt="media" />
				</a>
				<a target="_blank" rel="noopener noreferrer" href="https://x.com/freetailhackers">
					<img height="30px" width="auto" src="/media/twitter.png" alt="media" />
				</a>
			</div>
		</div>
		<div class="flex-column" id="c2">
			<div class="row category">Hacker Resources</div>
			<a target="_blank" rel="noopener noreferrer" href="#">Devpost</a>
			<a target="_blank" rel="noopener noreferrer" href="#">Discord</a>
			<a target="_blank" rel="noopener noreferrer" href="https://mlh.io/seasons/2025/events">MLH</a>
		</div>
		<div class="flex-column" id="c3">
			<div class="row category">Other Resources</div>
			<a target="_blank" rel="noopener noreferrer" href="https://uhsg.freetailhackers.com/">UHSG</a>
			<a target="_blank" rel="noopener noreferrer" href="https://yearofai.utexas.edu/">Year of AI</a
			>
		</div>
		<div class="flex-column" id="c4">
			<div class="row category">Other Hackathons</div>
			<a target="_blank" rel="noopener noreferrer" href="https://tamuhack.org/"> TAMUHack</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackuta.org"> HackUTA</a>
			<a target="_blank" rel="noopener noreferrer" href="https://www.unthackathon.com/">HackUNT</a>
			<a target="_blank" rel="noopener noreferrer" href="https://rowdyhacks.org/"> RowdyHacks</a>
			<a target="_blank" rel="noopener noreferrer" href="https://hackutd.co/"> HackUTD</a>
		</div>
	</div>
</footer>
<footer>
	<div class="footer-copyright-flex">
		<div class="flex-column">
			<a
				class="freetail-link"
				target="_blank"
				rel="noopener noreferrer"
				href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf">Code of Conduct</a
			>
		</div>
		<div class="flex-column">
			<a> <div>Copyright @ Freetail Hackers 2024</div></a>
		</div>
	</div>
</footer>

<style>
	#freetailcolumn {
		flex-basis: 300px;
	}

	#freetailmail {
		margin-bottom: 20px;
	}

	.bat-and-main {
		margin-bottom: 20px;
		font-size: 20px;
		display: inline-flex;
		gap: 19px;
	}
	.footer-bat {
		filter: brightness(0%);
		width: 50px;
		height: auto;
	}
	.footer-flex {
		align-items: flex-start;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
		margin: auto;
		max-width: 65em;
		color: black;
	}

	.login {
		display: inline-block;
		padding: 10px 20px;
		font-size: 16px;
		color: #fff;
		background-color: #007bff;
		border: none;
		border-radius: 10px;
		text-align: center;
		text-decoration: none;

		transition: background-color 0.3s ease;
	}

	.flex-column {
		font-weight: bold;
		display: flex;
		flex-direction: column;
		font-size: 18px;
		color: black;
	}

	.footer-copyright-flex {
		display: flex;
		justify-content: space-between;
		margin: auto;
		max-width: 67em;
	}

	.flex-column a {
		color: #000000;
		font-weight: normal;
	}

	a {
		color: #f2ebd9;
		text-decoration: none;
		line-height: 1.5;
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
		.flex-column {
			margin-bottom: 20px;
		}

		.footer-flex {
			margin: 25px;
			margin-bottom: 0px;
		}
		.footer-copyright-flex {
			margin: 20px;
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
