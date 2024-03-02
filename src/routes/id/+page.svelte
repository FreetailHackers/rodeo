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
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="overall-container">
	<div class="vertical-text" />

	<div class="driver-scan-div">
		<div class="driver-div">
			<h1 class="driver-div-text black">Driver</h1>
			<h1 class="driver-div-text red ">Name</h1>
			<div class="canvas">
				<canvas bind:this={canvas} id="qrcode" />
			</div>
		</div>

		<div class="ready-to-scan transform-vertical">
			<h4 class="ready-to-scan-text-ready black ">Are you ready?</h4>
			<h2 class="ready-to-scan-text-scan red">Show to Scan</h2>
		</div>
	</div>
</div>

<style>
	.driver-div {
		padding: 0.5rem 1.2rem 1.5rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 10px;
	}

	.driver-scan-div {
		display: flex;
		flex-direction: row;
	}
	.ready-to-scan {
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: end;
		justify-content: end;
		font-family: 'Geologica', sans-serif;
	}
	.ready-to-scan-text-ready {
		margin-left: -20px;
		font-weight: normal;
		margin-bottom: 30%;
		font-family: 'Geologica', sans-serif;
	}
	.ready-to-scan-text-scan {
		font-weight: bold;
		font-family: 'Fugaz One', sans-serif;
	}

	.transform-vertical {
		writing-mode: vertical-rl;
		transform: rotate(360deg);
	}

	.black {
		color: black;
	}
	.red {
		color: var(--primary-accent);
	}

	.driver-div-text {
		font-family: 'Fugaz One';
		text-align: left;
		font-size: 2.3rem;
	}

	.driver-div-text:last-of-type {
		margin-top: -20px;
	}

	.vertical-text {
		background-image: url('/hackerid/hackerid.svg');
		background-size: contain;
		background-repeat: no-repeat;
		width: 30%;
		height: 50rem;
		position: absolute;
		top: 50%;
		left: 20%;
		transform: translate(-50%, -50%);
	}

	.overall-container {
		display: flex;
		margin: 0 0;
		padding: 4rem 0;
		/* gap: 40px; */
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
		/* CSS rules specific to iPads: The banner text should be smaller here.*/
		.vertical-text {
			width: 20% !important;
			height: 50rem;
			top: 30%;
			left: 20%;
		}

		.driver-scan-div {
			display: flex;
			flex-direction: row;
			margin-left: 30%;
		}
	}

	/* CSS for devices with a maximum width of 768 pixels (tablets and smartphones) */
	@media only screen and (max-width: 768px) {
		canvas {
			width: 150px !important;
			height: 150px !important;
		}

		.driver-div {
			padding: 0.7rem 1.2rem 1.7rem;
			box-shadow: 4px 4px 16px 0px #00000040;
			border-radius: 10px;
		}

		.driver-scan-div {
			margin-left: 20%;
		}

		.driver-div-text {
			font-size: 20px;
		}
		.ready-to-scan-text-ready {
			font-size: 10px;
			margin-left: -15px;
		}

		.ready-to-scan-text-scan {
			font-size: 15px;
		}

		.vertical-text {
			width: 22%;
			height: 70%;
			top: 50%;
			left: 15%;
		}
	}
</style>
