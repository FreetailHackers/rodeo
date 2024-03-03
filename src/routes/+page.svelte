<script lang="ts">
	import Schedule from '$lib/components/schedule.svelte';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';

	// Some helpful error messages triggered in /src/lib/authenticate.ts
	onMount(() => {
		if (location.search === '?unauthenticated') {
			toasts.notify('You must be logged in to do perform that action.');
		} else if (location.search === '?forbidden') {
			toasts.notify('You do not have permissions to do that.');
		}
	});
</script>

<svelte:head>
	<title>Rodeo | Home</title>
</svelte:head>

<!-- {#if data.user !== undefined}
	<SvelteMarkdown source={data.settings.homepageText} />
	Admin announcements panel
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
{:else}
	<h2>Announcements</h2>
	<Announcements announcements={data.announcements} admin={false} />
{/if} -->

<!-- <SvelteMarkdown source={data.settings.homepageText} /> -->
<div class="topographic-background">
	<div class="red-image">
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src="/Group 34Red Stripe.svg" alt="Red-stripe picture" />
	</div>
	<div class="car">
		<img src="/pcar.png" alt="Car" class="car-image" />
	</div>
	<div class="formula-hacks">
		<h1>Formula Hacks</h1>
	</div>
	<div class="twenty-twenty-four">
		<p>2024</p>
	</div>
	<div class="what-is">
		<p>WHAT IS FORMULA HACKS?</p>
	</div>
	<div class="paragraph">
		<p>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate
		</p>
	</div>
	<svg class="bottom-square">
		<rect width="100vw" height="10vw" x="0" y="0" fill="white" />
	</svg>
</div>

<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />

<style>
	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		position: relative;
		z-index: -10;
	}

	.red-image {
		top: 0;
		left: 0;
		z-index: -1;
	}

	.car {
		position: absolute;
		top: -5vw;
		left: 5vw;
	}

	.car-image {
		width: 45vw;
		transform: rotate(-5.41deg);
	}

	.formula-hacks {
		position: absolute;
		top: 20vw;
		left: 10vw;
		color: #1c1c1c;
		font-size: 4vw;
		font-family: 'Zen Dots';
	}

	.twenty-twenty-four {
		position: absolute;
		top: 76vw;
		left: 3.5vw;
		color: #404040;
		font-family: 'Geo';
		font-size: 2vw;
	}

	.what-is {
		position: absolute;
		top: 81vw;
		left: 3.5vw;
		color: rgba(255, 255, 255, 1);
		font-family: 'Fugaz One';
		font-size: 4vw;
	}

	.paragraph {
		position: absolute;
		top: 95vw;
		left: 7vw;
		color: rgba(0, 0, 0, 1);
		font-family: 'Geologica';
		font-size: 2vw;
	}

	.bottom-square {
		width: 100vw;
		height: 10vw;
		margin-top: -2vw;
	}
</style>
