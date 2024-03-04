<script lang="ts">
	import Schedule from '$lib/components/schedule.svelte';
	import { toasts } from '$lib/stores';
	export let data;
	import { onMount } from 'svelte';
	import SvelteMarkdown from 'svelte-markdown';

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
		<img src="/Group 34Red Stripe.svg" alt="Red-stripe picture" />
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

<Schedule user={data.user} schedule={data.schedule} settings_timezone={data.settings.timezone} />

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

	@media (max-width: 1900px) {
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 380%;
		}
	}

	@media (max-width: 1700px) {
		.twenty-twenty-four {
			position: absolute;
			top: 65%;
			left: 5%;
			color: #404040;
			font-family: 'Geo';
			font-size: 360%;
		}
	}

	@media (max-width: 1500px) {
		.formula,
		.hacks {
			font-size: 410%;
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
			font-size: 340%;
		}
		.paragraph {
			position: absolute;
			top: 82.5%;
			left: 3%;
			color: rgba(0, 0, 0, 1);
			font-family: 'Geologica';
			font-size: 250%;
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
			font-size: 230%;
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
			font-size: 330%;
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
			top: 16.5%;
			font-size: 212.5%;
		}
		.hacks {
			top: 24%;
			font-size: 212.5%;
		}
		.car {
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
			top: 15%;
			font-size: 160%;
		}
		.hacks {
			top: 22.5%;
			font-size: 160%;
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
			top: 14%;
			font-size: 125%;
		}
		.hacks {
			top: 21.5%;
			font-size: 125%;
		}
		.car {
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
			top: 14%;
			font-size: 85%;
		}
		.hacks {
			top: 21%;
			font-size: 85%;
		}
		.car {
			width: 65%;
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
			top: 10.5%;
			font-size: 60%;
		}
		.hacks {
			top: 17.5%;
			font-size: 60%;
		}
		.car {
			width: 55%;
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
</style>
