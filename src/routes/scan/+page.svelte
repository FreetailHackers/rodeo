<script lang="ts">
	import UserCard from '$lib/components/userCard.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { User } from '@prisma/client';
	import { Html5Qrcode } from 'html5-qrcode';
	import { onDestroy } from 'svelte';

	let html5QrCode: Html5Qrcode;

	let action = '';
	let user: User | null;

	$: if (action === '') {
		html5QrCode?.stop();
	} else {
		html5QrCode = new Html5Qrcode('reader');
		const config = { fps: 10, qrbox: { width: 250, height: 250 } };
		html5QrCode.start({ facingMode: 'environment' }, config, handleScan, () => undefined);
	}

	async function handleScan(decodedText: string) {
		user = await trpc().getUser.query(decodedText);
	}

	onDestroy(() => {
		html5QrCode?.stop();
	});
</script>

<section>
	{#if action === ''}
		<button id="checkIn" on:click={() => (action = 'checkIn')}>Check In</button>
		<button id="lunch" on:click={() => (action = 'lunch')}>Lunch</button>
		<button id="dinner" on:click={() => (action = 'dinner')}>Dinner</button>
	{:else}
		<button id="cancel" on:click={() => (action = '')}>Cancel</button>
	{/if}
</section>
<div id="reader" />
{#if user}
	<UserCard {user} />
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
	}

	button {
		width: 100%;
		margin-bottom: 1rem;
	}

	#reader {
		position: absolute;
		width: 100%;
	}
</style>
