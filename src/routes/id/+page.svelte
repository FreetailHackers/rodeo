<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.id, {
			width: 300,
		});
	});
</script>

<svelte:head>
	<title>Formula Hacks | Hacker ID</title>
</svelte:head>

<div class="overall-container">
	<h1 class="vertical-text">HACKER ID</h1>

	<div class="driver-div">
		<h1 class="driver-div-text">Driver</h1>
		<h1 class="driver-div-text red ">License</h1>
		<canvas bind:this={canvas} id="qrcode" />
	</div>

	<div class="ready-to-scan">
		<h4 class="ready-to-scan-text-ready">Are you ready?</h4>
		<h2 class="ready-to-scan-text-scan red">Show to Scan</h2>
	</div>
</div>

<style>
	.overall-container {
		display: flex;
		padding-top: 56px;
		justify-content: center;
		align-items: center;
		min-height: calc(100vh - 159px);
	}

	.vertical-text {
		font-size: 70px;
		color: transparent;
		-webkit-text-stroke: 0.5px #ffc75b;
		text-shadow: 0.8em -0.35em var(--highlight-color), -0.4em 1em #e96954;
		writing-mode: vertical-rl;
	}

	.driver-div {
		padding: 1rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 10px;
		margin: 5rem 0;
	}

	.driver-div-text {
		font-family: 'Fugaz One';
		font-size: 2.3rem;
	}

	.ready-to-scan {
		writing-mode: vertical-rl;
		height: 25rem;
		margin: 30px;
		text-align: right;
	}

	.ready-to-scan-text-ready {
		margin: 0;
		font-weight: normal;
		margin-bottom: 30%;
		font-family: 'Geologica', sans-serif;
	}

	.ready-to-scan-text-scan {
		margin: 0;
		font-weight: bold;
		font-family: 'Fugaz One', sans-serif;
	}

	.driver-div-text:last-of-type {
		margin-top: -20px;
	}

	.red {
		color: var(--primary-accent);
	}

	/* Mobile Devices */
	@media only screen and (max-width: 767px) {
		.overall-container {
			flex-direction: column;
			min-height: calc(100vh - 56px);
		}

		.vertical-text {
			writing-mode: horizontal-tb;
			font-size: 40px;
			text-align: center;
			-webkit-text-stroke: 0px transparent;
			text-shadow: -0.03em -0.03em #e96954, 0.1em 0.1em var(--highlight-color);
		}

		.driver-div {
			margin: 0;
			padding: 0 1rem;
		}

		.driver-div-text {
			font-size: 25px;
		}

		.ready-to-scan {
			writing-mode: horizontal-tb;
			height: auto;
			width: 21rem;
		}

		.ready-to-scan-text-ready {
			font-size: 15px;
			margin: 0;
		}

		.ready-to-scan-text-scan {
			font-size: 20px;
			margin-top: 6px;
		}
	}
</style>
