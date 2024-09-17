<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import { toasts } from '$lib/stores';
	import { onMount } from 'svelte';
	import Announcements from '$lib/components/announcements.svelte';

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
			<SvelteMarkdown source={data.settings.homepageText} />
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
</div>

<style>
</style>
