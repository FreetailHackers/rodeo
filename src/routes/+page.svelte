<script lang="ts">
	import Announcements from '$lib/components/announcements.svelte';
	import FAQ from '$lib/components/faq.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';
	import Challenges from '$lib/components/challenges.svelte';
	import SvelteMarkdown from 'svelte-markdown';
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

	if (data.settings.spongebobCase) {
    	data.settings.homepageText = data.settings.homepageText
    		.split('')
    		.map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
    		.join('');
    }
</script>

<svelte:head>
	<title>Formula Hacks | Home</title>
</svelte:head>

<div class="topographic-background">
	<div>
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src="/Landing.svg" alt="svg" class="home-svg" />
		<div class="homepage-text">
			<SvelteMarkdown source={data.settings.homepageText} />
		</div>
	</div>
</div>
<div>
	{#if data.settings.showAnnouncements}
		{#if data.user !== undefined}
			<!-- Admin announcements panel -->
			<section id="Announcements">
				<Announcements
					announcements={data.announcements}
					admin={data.user.roles.includes('ADMIN')}
				/>
			</section>
		{:else}
			<section id="Announcements">
				<Announcements announcements={data.announcements} admin={false} />
			</section>
		{/if}
	{/if}
</div>

{#if data.settings.showSchedule}
	<section id="Schedule">
		<Schedule
			user={data.user}
			schedule={data.schedule}
			settings_timezone={data.settings.timezone}
		/>
	</section>
{/if}

{#if data.settings.showFAQ}
	<section id="FAQ">
		<FAQ user={data.user} questions={data.faqs} />
	</section>
{/if}

{#if data.settings.showChallenges}
	<section id="Challenges">
		<Challenges user={data.user} challenges={data.challenges} />
	</section>
{/if}

{#if data.settings.showSponsors}
	<section id="Sponsors">
		<Sponsors user={data.user} sponsors={data.sponsors} />
	</section>
{/if}

<style>
	section {
		scroll-margin-top: 5vh;
	}

	.home-svg {
		width: 100vw;
		margin-top: calc(2rem - 0.5vw);
		user-select: none;
		pointer-events: none;
	}

	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background: linear-gradient(to bottom, transparent 0%, #1c1c1c 100%),
			url('/Topographic Background.svg');
		background-size: 110%;
		position: relative;
	}

	.homepage-text {
		position: absolute;
		top: 73%;
		left: 15%;
		color: #f2ebd9;
		font-size: clamp(0.75rem, 2vw, 2rem);
		max-width: 50rem;
		margin-right: 4rem;
	}
</style>
