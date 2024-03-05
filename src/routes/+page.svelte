<script lang="ts">
	import Schedule from '$lib/components/schedule.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';
	import SvelteMarkdown from 'svelte-markdown';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';
	import Announcements from '$lib/components/announcements.svelte';

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

<div class="topographic-background">
	<img src="Landing.svg" alt="svg" class="home-svg" />
	<div class="paragraph">
		<SvelteMarkdown source={data.settings.homepageText} />
	</div>
</div>
<div>
	{#if data.user !== undefined}
		<!-- Admin announcements panel -->
		<section id="Announcements">
			<Announcements announcements={data.announcements} admin={data.user.roles.includes('ADMIN')} />
		</section>
	{:else}
		<section id="Announcements">
			<Announcements announcements={data.announcements} admin={false} />
		</section>
	{/if}
</div>

<section id="Schedule">
	<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />
</section>

<section id="Sponsors">
	<Sponsors
		sponsors={['Roblox', 'Capital One', 'Mercury Financial', 'Red Bull', 'Stand Out Stickers']}
	/>
</section>

<style>
	.home-svg {
		width: 100vw;
		height: auto;
		margin-top: calc(2rem - 0.5vw);
	}

	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background: linear-gradient(
				to bottom,
				#1c1c1c 0%,
				transparent 30%,
				transparent 50%,
				#1c1c1c 100%
			),
			url('/Topographic Background.svg');
		background-size: 110%;
		position: relative;
		z-index: -10;
	}

	.paragraph {
		position: absolute;
		top: 82.5%;
		left: 3%;
		color: #f2ebd9;
		font-family: 'Geologica';
		font-size: 32px;
		max-width: 80%;
	}

	section {
		scroll-margin-top: 5vh;
	}

	@media (max-aspect-ratio: 4/4) {
		.paragraph {
			font-size: 16px;
		}
	}
</style>
