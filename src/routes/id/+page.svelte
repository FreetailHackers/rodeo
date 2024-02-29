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


	<div class = "vertical-text">
	</div>

	<div class = "driver-scan-div">
		<div class = "driver-div">
			<h1 class = "driver-div-text black">Driver </h1>
			<h1 class = "driver-div-text red ">Name</h1>
			<div class = "canvas">
				<!-- <canvas bind:this={canvas} id="qrcode" /> -->
			</div>
		</div>

		<div class = "ready-to-scan">
			<h4 class = "ready-to-scan-text-ready black transform-vertical">Are you ready?</h4>
			<h2 class = "ready-to-scan-text-scan red transform-vertical"> Show to Scan</h2>
		</div>

	</div>

</div>

<style>
	/* .vertical-text {
	writing-mode: vertical-rl;
	transform: rotate(360deg);
	} */
	.canvas{
		width: 300px;
		height:300px;
		background-color: #D9D9D9;
	}
	.driver-div{
		padding: 0.7rem 1.5rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040; 
		border-radius: 10px;

	}

	.driver-scan-div{
		display: flex;
		flex-direction: row;
	}
	.ready-to-scan{
		display: flex;
		flex-direction: row-reverse;
		gap: 5px;
	}
	.ready-to-scan-text-ready {
		display: flex;
		align-items: center;
	}

	.ready-to-scan-text-scan{

	}

	.transform-vertical{
		writing-mode: vertical-rl;
		transform: rotate(360deg);
	}

	.ready-to-scan-text:first-of-type{
		margin-bottom: -100px;
	}

	.black{
		color:var(--black)
	}
	.red{
		color: var(--burnt-orange);
	}

	.driver-div-text{
		font-family: "Fugaz One";
		text-align: left;
	}

	.driver-div-text:last-of-type{
		margin-top: -20px;
	}

	.vertical-text {
		background-image: url("hackerid.svg");
		background-size: cover; 
		background-repeat: no-repeat; 
		width: 14rem;
		min-height: 200px ; 
		height: 40rem;
		position: absolute;
		top: 50%; 
		left: 20%; 
		transform: translate(-50%, -50%); 
	}



	.text{
		font-family: 'Zen Dots', sans-serif;
		font-size: 4rem;
		font-weight: 400;
		line-height: 180px;
		letter-spacing: 0em;
		text-align: left;
		position: relative;
	}

	.overall-container {
		display: flex;
		margin: 0 0;
		padding: 4rem 0;
		/* gap: 40px; */
		justify-content: center;
		align-items: center;

	}


	.purple-border {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		height: 24rem;
		border-radius: 28px;
		background: #8b4f77;
		width: fit-content;
	}

	.white-border {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 38px;
		margin-top: 20px;
		margin-left: 20px;
		margin-right: 20px;
		margin-bottom: 10px;
		background: #f7f7ff;
		width: fit-content;
	}

	span {
		font-family: 'ruddy', sans-serif;
		font-weight: 700;
		font-style: normal;
		color: white;
		text-transform: uppercase;
		font-size: xx-large;
		line-height: normal;
	}

	canvas {
		display: block;
		margin: 0 auto;
		padding: 0;
		margin: 20px;
		/* width: 100px; */
	}
</style>
