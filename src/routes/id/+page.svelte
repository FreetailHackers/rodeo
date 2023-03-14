<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.magicLink, {
			width: 250,
		});
	});
</script>

<canvas bind:this={canvas} id="qrcode" />

<style>
	canvas {
		display: block;
		margin: 0 auto;
	}
</style>
