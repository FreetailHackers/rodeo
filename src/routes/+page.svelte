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
		<img src="/Homepage Red Background.svg" alt="Red-stripe picture" />
		<div class="car">
			<img src="/pcar.png" alt="Car" class="car-image" />
		</div>
		<div class="formula">
			<h1>Formula</h1>
		</div>
		<div class="hacks">
			<h1>Hacks</h1>
		</div>
		<div class="twenty-twenty-four">
			<p>2024</p>
		</div>
		<div class="what-is">
			<p>WHAT IS FORMULA HACKS?</p>
		</div>
		<div class="paragraph">
			<SvelteMarkdown source={data.settings.homepageText} />
		</div>
	</div>
</div>
<div class="pad">
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
	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		background-size: 110%;
		position: relative;
		z-index: -10;
	}

	.red-image {
		position: relative;
		width: 100%;
		z-index: -1;
	}

	.car {
		position: absolute;
		top: -4%;
		left: 5%;
	}

	.car-image {
		width: 60%;
		transform: rotate(-5.41deg);
	}

	.formula {
		position: absolute;
		top: 17.5%;
		left: 7%;
		color: #1c1c1c;
		font-size: 450%;
		font-family: 'Zen Dots';
	}

	.hacks {
		position: absolute;
		top: 25%;
		left: 7%;
		color: #1c1c1c;
		font-size: 450%;
		font-family: 'Zen Dots';
	}

	.twenty-twenty-four {
		position: absolute;
		top: 65%;
		left: 5%;
		color: #404040;
		font-family: 'Geo';
		font-size: 390%;
	}

	.what-is {
		position: absolute;
		top: 71.5%;
		left: 3%;
		color: rgba(255, 255, 255, 1);
		font-family: 'Fugaz One';
		font-size: 450%;
	}

	.paragraph {
		position: absolute;
		top: 82.5%;
		left: 3%;
		color: rgba(0, 0, 0, 1);
		font-family: 'Geologica';
		font-size: 250%;
		max-width: 80%;
	}

	@media (max-width: 5000px) {
		.formula {
			font-size: 1450%;
		}
		.hacks {
			font-size: 1450%;
		}
		.car {
			top: -1%;
			width: 61%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 67%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 750%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 1300%;
		}
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 775%;
			max-width: 80%;
		}
	}

	@media (max-width: 3000px) {
		.formula {
			font-size: 850%;
		}
		.hacks {
			font-size: 850%;
		}
		.car {
			top: -1%;
			width: 62%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 67.1%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 430%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 775%;
		}
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 470%;
			max-width: 80%;
		}
	}

	@media (max-width: 2250px) {
		.formula {
			font-size: 620%;
		}
		.hacks {
			font-size: 620%;
		}
		.car {
			top: -1%;
			width: 65%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 66.25%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 400%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 580%;
		}
		.paragraph {
			position: absolute;
			top: 83%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 345%;
			max-width: 80%;
		}
	}

	@media (max-width: 1900px) {
		.formula {
			font-size: 520%;
		}
		.hacks {
			font-size: 520%;
		}
		.car {
			top: -1%;
			width: 65%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65.5%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 380%;
		}
		.what-is {
			position: absolute;
			top: 71.7%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 500%;
		}
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 290%;
			max-width: 80%;
		}
	}

	@media (max-width: 1700px) {
		.formula {
			font-size: 450%;
		}
		.hacks {
			font-size: 450%;
		}
		.car {
			top: -1%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 360%;
		}
		.what-is {
			position: absolute;
			top: 71.5%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 440%;
		}
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 250%;
			max-width: 80%;
		}
	}

	@media (max-width: 1500px) {
		.formula,
		.hacks {
			font-size: 410%;
		}
		.car {
			top: -1%;
			width: 67%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 340%;
		}
		.what-is {
			position: absolute;
			top: 71.5%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 400%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 225%;
		}
	}

	@media (max-width: 1350px) {
		.formula,
		.hacks {
			font-size: 370%;
		}
		.car {
			width: 67%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 310%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 350%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 205%;
		}
	}

	@media (max-width: 1225px) {
		.formula,
		.hacks {
			font-size: 345%;
		}
		.car {
			width: 67%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 280%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 310%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 190%;
		}
	}

	@media (max-width: 1150px) {
		.formula,
		.hacks {
			font-size: 320%;
		}
		.car {
			width: 67%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 250%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 290%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 175%;
		}
	}

	@media (max-width: 1000px) {
		.formula,
		.hacks {
			font-size: 285%;
		}
		.car {
			top: -1%;
			width: 68%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 220%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 260%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 150%;
		}
	}

	@media (max-width: 900px) {
		.formula,
		.hacks {
			font-size: 260%;
		}
		.car {
			top: -0.5%;
			width: 69%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 195%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 230%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 135%;
		}
	}

	@media (max-width: 800px) {
		.formula {
			top: 17.5%;
			font-size: 212.5%;
		}
		.hacks {
			top: 25%;
			font-size: 212.5%;
		}
		.car {
			top: -0.25%;
			width: 68%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 165%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 190%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 112%;
		}
	}

	@media (max-width: 600px) {
		.formula {
			top: 19%;
			font-size: 170%;
		}
		.hacks {
			top: 26%;
			font-size: 170%;
		}
		.car {
			top: 1%;
			width: 67%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 125%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 150%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 90%;
		}
	}

	@media (max-width: 500px) {
		.formula {
			top: 20%;
			font-size: 140%;
		}
		.hacks {
			top: 27%;
			font-size: 140%;
		}
		.car {
			top: 2%;
			width: 66%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 105%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 125%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 75%;
		}
	}

	@media (max-width: 400px) {
		.formula {
			top: 21%;
			left: 8%;
			font-size: 120%;
		}
		.hacks {
			top: 28%;
			left: 8%;
			font-size: 120%;
		}
		.car {
			top: 4%;
			left: 8%;
			width: 68%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 85%;
		}
		.what-is {
			position: absolute;
			top: 72%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 100%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 60%;
		}
	}

	@media (max-width: 300px) {
		.formula {
			top: 23%;
			font-size: 75%;
		}
		.hacks {
			top: 30%;
			font-size: 75%;
		}
		.car {
			top: 8%;
			left: 8%;
			width: 60%;
		}
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 60%;
		}
		.what-is {
			position: absolute;
			top: 71.5%;
			left: 3%;
			color: rgba(255, 255, 255, 1);
			font-family: 'Fugaz One';
			font-size: 75%;
		}

		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 45%;
		}
	}
	.pad {
		padding-top: 5vh;
	}

	section {
		scroll-margin-top: 5vh;
	}
</style>
