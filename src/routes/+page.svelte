<script lang="ts">
	import Announcements from '$lib/components/announcements.svelte';
	import FAQ from '$lib/components/faq.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';
	import Prizes from '$lib/components/prizes.svelte';
	// import SvelteMarkdown from 'svelte-markdown';
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

<!-- <div>
	<div class="homepage-text">
		<SvelteMarkdown source={data.settings.homepageText} />
	</div>
</div> -->

{#if data.settings.showAnnouncements}
	<section id="Announcements">
		<Announcements announcements={data.announcements} />
	</section>
{/if}

{#if data.settings.showSchedule}
	<section id="Schedule">
		<Schedule schedule={data.schedule} settingsTimezone={data.settings.timezone} />
	</section>
{/if}

{#if data.settings.showChallenges}
	<section id="Prizes">
		<Prizes prizes={data.prizes} />
	</section>
{/if}

{#if data.settings.showFAQ}
	<section id="FAQ">
		<FAQ questions={data.faqs} />
	</section>
{/if}

{#if data.settings.showSponsors}
	<section id="Sponsors">
		<Sponsors sponsors={data.sponsors} />
	</section>
{/if}

<style>
	section {
		scroll-margin-top: 5vh;
	}
</style>
