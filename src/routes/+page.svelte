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
</script>

<svelte:head>
	<title>Formula Hacks | Home</title>
</svelte:head>

<div>
	<div class="homepage-text">
		<SvelteMarkdown source={data.settings.homepageText} />
	</div>
</div>

{#if data.settings.showAnnouncements}
	<section id="Announcements">
		<Announcements announcements={data.announcements} />
	</section>
{/if}

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
		<FAQ questions={data.faqs} />
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
