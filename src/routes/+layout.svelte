<script lang="ts">
	import { page } from '$app/stores';
	import Toasts from '$lib/components/toasts.svelte';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import './global.css';
	import { fly } from 'svelte/transition';
	import { cubicIn, cubicOut } from 'svelte/easing';
	import Loader from '$lib/components/loader.svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { activeTab } from '$lib/navStore';

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
				hamburgerCheckbox.checked = false;
			});
		}
	});

	function setActiveTab(tab: string) {
		activeTab.set(tab);
	}

	function handleKeyPress(event: KeyboardEvent, tab: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			setActiveTab(tab);
		}
	}
</script>

<nav>
	<label for="hamburgerCheckbox" id="hamburger"><b>MENU</b></label>
	<input
		type="checkbox"
		id="hamburgerCheckbox"
		bind:this={hamburgerCheckbox}
		style="display: none"
	/>
	<menu id="menu" bind:this={menu}>
		<li class:selected={$activeTab === 'home'}>
			<a
				href="/"
				on:click={() => setActiveTab('home')}
				on:keydown={(e) => handleKeyPress(e, 'home')}
			>
				Home
			</a>
		</li>
		<li class:selected={$activeTab === 'schedule'}>
			<a
				href="/schedule"
				on:click={() => setActiveTab('schedule')}
				on:keydown={(e) => handleKeyPress(e, 'schedule')}
			>
				Schedule
			</a>
		</li>
		<li class:selected={$activeTab === 'info'}>
			<a
				href="/info"
				on:click={() => setActiveTab('info')}
				on:keydown={(e) => handleKeyPress(e, 'info')}
			>
				Info
			</a>
		</li>
		<!-- NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed -->
		{#if data.user !== null && (data.user.role !== 'HACKER' || data.user.status === 'CONFIRMED')}
			<li class:selected={$activeTab === 'id'}>
				<a
					href="/id"
					on:click={() => setActiveTab('id')}
					on:keydown={(e) => handleKeyPress(e, 'id')}
				>
					My Hacker ID
				</a>
			</li>
		{/if}
		{#if data.user?.role === 'ORGANIZER' || data.user?.role === 'ADMIN'}
			<li class:selected={$activeTab === 'scan'}>
				<a
					href="/scan"
					on:click={() => setActiveTab('scan')}
					on:keydown={(e) => handleKeyPress(e, 'scan')}
				>
					Scan
				</a>
			</li>
		{/if}
		{#if data.user?.role === 'HACKER'}
			<li class:selected={$activeTab === 'scan'}>
				<a
					href="/apply"
					on:click={() => setActiveTab('apply')}
					on:keydown={(e) => handleKeyPress(e, 'apply')}
				>
					Apply
				</a>
			</li>
		{:else if data.user?.role === 'ADMIN'}
			<li class:selected={$activeTab === 'user'}>
				<a
					href="/user"
					on:click={() => setActiveTab('user')}
					on:keydown={(e) => handleKeyPress(e, 'user')}
				>
					User
				</a>
			</li>
			<li class:selected={$activeTab === 'admin'}>
				<a
					href="/admin"
					on:click={() => setActiveTab('admin')}
					on:keydown={(e) => handleKeyPress(e, 'admin')}
				>
					Admin
				</a>
			</li>
			<li class:selected={$activeTab === 'admissions'}>
				<a
					href="/admissions"
					on:click={() => setActiveTab('admissions')}
					on:keydown={(e) => handleKeyPress(e, 'admissions')}
				>
					Admissions
				</a>
			</li>
		{/if}
		<li class:selected={$activeTab === 'feedback'}>
			<a
				href="/feedback"
				on:click={() => setActiveTab('feedback')}
				on:keydown={(e) => handleKeyPress(e, 'feedback')}
			>
				Feedback
			</a>
		</li>
	</menu>
	<hr />

	{#if isLoading}
		<div class="overlay">
			<Loader />
		</div>
	{/if}
</nav>

{#key data.pathname}
	<div
		in:fly={{ easing: cubicOut, y: 10, duration: 300, delay: 400 }}
		out:fly={{ easing: cubicIn, y: -10, duration: 300 }}
	>
		<slot />
	</div>
{/key}

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
	nav {
		position: sticky;
		top: 0;
		margin-top: 0;
		background-color: white;
		z-index: 99;
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
	}

	#hamburger {
		display: block;
		width: 100%;
		padding-top: 1rem;
	}

	#hamburgerCheckbox:checked + menu {
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
		background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background color */
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.selected {
		font-weight: bolder;
	}
</style>
