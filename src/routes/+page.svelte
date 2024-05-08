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
	<title>Rodeo | Home</title>
</svelte:head>

<div class="homepage-content">
	<SvelteMarkdown source={data.settings.homepageText} />
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
		<Sponsors sponsors={[]} />
	</section>
{/if}
