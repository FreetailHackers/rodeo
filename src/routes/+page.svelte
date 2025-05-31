<script lang="ts">
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import Announcements from '$lib/components/announcements.svelte';
	import Schedule from '$lib/components/schedule.svelte';
	import FAQ from '$lib/components/faq.svelte';
	import Challenges from '$lib/components/challenges.svelte';
	import Sponsors from '$lib/components/sponsors.svelte';

	export let data;

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

<div class="main-content">
	<div>
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<div class="homepage-text">
			{#await import('svelte-markdown')}
				<p>Loading...</p>
			{:then module}
				<svelte:component this={module.default} source={data.settings.homepageText} />
			{/await}
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

		{#if data.settings.showSchedule && data.events.length > 0}
			<section id="Schedule">
				<Schedule schedule={data.events} settingsTimezone={data.settings.timezone} />
			</section>
		{/if}

		{#if data.settings.showChallenges && data.challenges.length > 0}
			<section id="Challenges">
				<Challenges challenges={data.challenges} />
			</section>
		{/if}

		{#if data.settings.showFAQ && data.faq.length > 0}
			<section id="FAQ">
				<FAQ faqs={data.faq} />
			</section>
		{/if}

		{#if data.settings.showSponsors && data.sponsors.length > 0}
			<section id="Sponsors">
				<Sponsors sponsors={data.sponsors} user={data.user} />
			</section>
		{/if}
	</div>
</div>

<style>
	.homepage-text {
		margin-bottom: 2.5rem;
	}
</style>
