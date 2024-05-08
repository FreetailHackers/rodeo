<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	// NOTE: if we ever add a mentor/judge/volunteer application this needs to be changed
	if (
		!data.user.roles.includes('HACKER') ||
		data.user.roles.length > 1 ||
		data.user.status === 'CONFIRMED'
	) {
		onMount(() => {
			QRCode.toCanvas(canvas, data.user.id, {
				width: 250,
			});
		});
	}
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class=" main-content ">
	{#if !data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED'}
		<h1>Hacker ID</h1>

		<div class="white-border">
			<canvas bind:this={canvas} id="qrcode" />
		</div>
	{:else}
		<p>
			Thank you for your interest in the hackathon. Once your participation is confirmed, your
			unique <b>Hacker ID</b> for the event will be displayed on this page. To ensure your
			participation, please complete the application process by visiting the
			<a href="/apply">Apply</a>
			page. We highly value your feedback on Rodeo. Please take a moment to share your thoughts with
			us by filling out our
			<a
				href="https://docs.google.com/forms/d/e/1FAIpQLSdQld-vgVLXOuIXIcUNpTFMwii_7Cu9Vqj7CVxXs3ScFsCIrg/viewform"
				>Feedback Form</a
			>. Thank you for your cooperation.
		</p>
	{/if}

	<form method="POST" action="/logout">
		<button class="button" type="submit">Logout</button>
	</form>
</div>

<style>
	.main-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	button {
		margin-top: 20px;
		width: calc(250px + 20px);
		border-radius: 10px;
	}

	.white-border {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 40px;
		margin: 20px;
		background: white;
		width: fit-content;
		box-shadow: 0 0 15px 5px rgba(0, 0, 0, 0.25); /* Black box shadow */
	}

	canvas {
		margin: 20px;
	}
</style>
