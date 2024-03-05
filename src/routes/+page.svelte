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
	<div class="red-image">
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src="/Landing.svg" alt="svg" class="home-svg" />
		<div class="paragraph">
			<SvelteMarkdown source={data.settings.homepageText} />
		</div>
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

	@media (max-width: 5000px) {
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 775%;
			max-width: 80%;
		}
	}

	@media (max-width: 3000px) {
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 470%;
			max-width: 80%;
		}
	}

	@media (max-width: 2250px) {
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 345%;
			max-width: 80%;
		}
	}

	@media (max-width: 1900px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 290%;
			max-width: 80%;
		}
	}

	@media (max-width: 1700px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 250%;
			max-width: 80%;
		}
	}

	@media (max-width: 1500px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 225%;
		}
	}

	@media (max-width: 1350px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 205%;
		}
	}

	@media (max-width: 1225px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 190%;
		}
	}

	@media (max-width: 1150px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 175%;
		}
	}

	@media (max-width: 1000px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 150%;
		}
	}

	@media (max-width: 900px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 135%;
		}
	}

	@media (max-width: 800px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 112%;
		}
	}

	@media (max-width: 600px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 90%;
		}
	}

	@media (max-width: 500px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 75%;
		}
	}

	@media (max-width: 400px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 60%;
		}
	}

	@media (max-width: 300px) {
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			font-family: 'Geologica';
			font-size: 45%;
		}
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
