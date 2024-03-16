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
	<div class="vertical-text">
		<h1 class="vertical-text-first">HACKER ID</h1>
		<h1 class="vertical-text-second">HACKER ID</h1>
		<h1 class="vertical-text-third">HACKER ID</h1>
	</div>

	<div class="driver-scan-div">
		<div class="driver-div">
			<h1 class="driver-div-text black">Driver</h1>
			<h1 class="driver-div-text red ">License</h1>
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
		padding: 1rem 1rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 10px;
		position: relative;
		z-index: inherit;
		background-color: white;
		min-height: 400px;
		justify-content: start;
		align-items: start;
		display: flex;
		flex-direction: column;
		max-width: 90vw;
	}

	.driver-scan-div {
		display: flex;
		flex-direction: row;
		position: relative;
		padding-left: 121.133px;
	}

	.ready-to-scan {
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: end;
		justify-content: end;
		font-family: 'Geologica', sans-serif;
		writing-mode: vertical-rl;
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
		position: relative;
	}

	.driver-div-text:last-of-type {
		margin-top: -20px;
	}

	.vertical-text {
		/* background-image: url('/hackerid/hackerid.svg'); */
		writing-mode: vertical-rl;
		position: absolute;
		top: calc(50% - 159px - 90px);
		left: 0;
		z-index: 0;
		min-width: 30vw;
		min-height: 100%;
	}

	.vertical-text h1 {
		font-size: 70px;
	}

	.vertical-text-first {
		color: #f2ebd9bf;
		margin-top: 30px;
	}
	.vertical-text-second {
		color: transparent;
		-webkit-text-stroke: 1px #ffc75b;
		margin-right: -100px;
	}

	.vertical-text-third {
		color: #e1563fbf;
		margin-right: -20px;
	}

	.overall-container {
		display: flex;
		margin: 0;
		padding: 10rem 2rem;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		position: relative;
		min-height: calc(100vh - 159px);
	}

	@media only screen and (min-device-width: 768px) and (max-device-width: 1024px) {
		.driver-scan-div {
			margin-left: 15%;
			padding-left: 0;
		}

		.overall-container {
			padding: 6rem 4rem;
		}
	}

	/* CSS for devices with a maximum width of 768 pixels (tablets and smartphones) */
	@media only screen and (max-width: 767px) {
		.overall-container {
			flex-direction: column;
			min-height: calc(100vh - 56px);
		}

		.driver-div {
			padding: 1rem 1.5rem 2rem;
		}

		.vertical-text {
			writing-mode: horizontal-tb;
			width: auto;
			height: auto;
			top: 2%;
			left: 1%;
			transform: none;
			position: relative;
		}

		.vertical-text-second {
			margin-top: -20%;
		}

		.vertical-text-third {
			margin-top: -20%;
		}

		.vertical-text h1 {
			font-size: 38px;
		}

		canvas {
			width: 200px !important;
			height: 200px !important;
		}

		.canvas {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.ready-to-scan {
			writing-mode: horizontal-tb;
			justify-content: start;
			align-items: start;
			gap: 0;
			margin-top: 30px;
		}

		.driver-scan-div {
			flex-direction: column;
			padding-left: 0;
		}

		.driver-div-text {
			font-size: 25px;
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
