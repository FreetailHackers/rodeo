<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	// import '../global.css';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Loader from '$lib/components/loader.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';

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
				hamburgerCheckbox.checked = false;
			});
		}
	});
</script>

<h1>Admin Panel</h1>

<nav>
	<label for="adminHamburgerCheckbox" id="hamburger"><b>MENU</b></label>
	<input
		type="checkbox"
		id="adminHamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<li><a href="/admin" class:active={$page.url.pathname === '/admin'}>Admin Settings</a></li>
		<li>
			<a href="/admin/templates" class:active={$page.url.pathname === '/admin/templates'}
				>Email Templates</a
			>
		</li>
		<li>
			<a href="/admin/questions" class:active={$page.url.pathname === '/admin/questions'}
				>Registration Questions</a
			>
		</li>
	</menu>
	<hr />

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#key $page.url.pathname}
	<div in:fly={{ easing: cubicOut, y: 10, duration: 300 }}>
		<slot />
	</div>
{/key}

<Toasts />

<style>
	nav {
		position: sticky;
		top: 0;
		margin-top: 0;
		background-color: white;
		z-index: 99;
		/* display: flex; */
	}

	menu {
		list-style: none;
		margin: 0;
		padding: 0;
		transition: all 0.5s ease-out;
		background-color: white;
		max-height: 0;
		overflow: hidden;
		width: 100%;
		display: flex;
		justify-content: center;
	}

	#hamburger {
		display: block;
		width: 100%;
		padding-top: 1rem;
	}

	#adminHamburgerCheckbox:checked + menu {
		display: flex;
		flex-direction: column;
		max-height: 100vh;
	}

	menu a {
		display: block;
		width: 100%;
		padding: 0.7rem 0;
	}

	@media (min-width: 768px) {
		#hamburger {
			display: none;
		}

		menu {
			margin: 0;
			padding-top: 1rem;
			display: flex;
			max-height: fit-content;
		}

		menu li + li::before {
			content: '|';
			padding: 0.5rem;
		}

		menu a {
			display: inline;
			width: initial;
		}
	}

	hr {
		margin-top: 1rem;
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
	}
</style>
