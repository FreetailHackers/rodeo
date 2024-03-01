<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.id, {
			width: 250,
		});
	});
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="overall-container">
	<!-- <div class="purple-border">
		<div class="white-border">
			<canvas bind:this={canvas} id="qrcode" />
		</div>
		<div class="text"><span>My Hacker ID</span></div>
	</div> -->

	<div class = "vertical-text"></div>

	<div class="driver-scan-div">
		<div class="driver-div">
			<h1 class="driver-div-text black">Driver</h1>
			<h1 class="driver-div-text red ">Name</h1>
			<div class="canvas">
				<!-- <canvas bind:this={canvas} id="qrcode" /> -->
			</div>
		</div>

		<div class="ready-to-scan transform-vertical">
			<h4 class="ready-to-scan-text-ready black ">Are you ready?</h4>
			<h2 class="ready-to-scan-text-scan red">Show to Scan</h2>
		</div>
	</div>
</div>

<style>
	.canvas {
		width: 300px;
		height: 300px;
		background-color: #d9d9d9;
	}
	.driver-div {
		padding: 0.7rem 1.5rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 10px;
	}

	.driver-scan-div {
		display: flex;
		flex-direction: row;
	}
	.ready-to-scan {
		display: flex;
		flex-direction: column;;
		gap: 5px;
		align-items: end;
		justify-content: end;
		font-family: "Geologica", sans-serif;
	}
	.ready-to-scan-text-ready {
		display: flex;
		margin-left: -20px;
		font-weight: normal;
		margin-bottom: 30%;
		font-family: "Geologica", sans-serif;

	}
	.ready-to-scan-text-scan {
		font-weight: bold;
		font-family: "Fugaz One", sans-serif;
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
	}

	.driver-div-text:last-of-type {
		margin-top: -20px;
	}

	.vertical-text {
		background-image: url('hackerid.svg');
		background-size: cover;
		background-repeat: no-repeat;
		width: 15rem;
		min-height: 200px;
		height: 60rem;
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

	canvas {
		display: block;
		margin: 0 auto;
		padding: 0;
		margin: 20px;
		/* width: 100px; */
	}
</style>
