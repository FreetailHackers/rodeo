<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.id, {
			width: 200,
		});
	});
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="overall-container">
	<div class="purple-border">
		<div class="white-border">
			<canvas bind:this={canvas} id="qrcode" />
		</div>
		<span>My Hacker ID</span>
	</div>
</div>

<style>
	.overall-container {
		display: flex;
		justify-content: center;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.purple-border {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		height: 25rem;
		border-radius: 28px;
		background: #8b4f77;
		width: fit-content;
	}

	.white-border {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 38px;
		margin: 20px;
		margin-bottom: 40px;
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
		width: 100px;
	}
</style>
