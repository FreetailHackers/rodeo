<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data: PageData;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.magicLink, {
			width: 300,
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
