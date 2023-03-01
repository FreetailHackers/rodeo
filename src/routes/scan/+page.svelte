<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/userCard.svelte';
	import { trpc } from '$lib/trpc/client';
	import { Role, Status, type User } from '@prisma/client';
	import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
	import { onDestroy } from 'svelte';

	let html5QrCode: Html5Qrcode;
	let dialog: HTMLDialogElement;

	let action = '';
	let user: User | null = null;

	$: if (action === '') {
		if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
			html5QrCode?.stop();
		}
	} else {
		html5QrCode = new Html5Qrcode('reader');
		const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };
		html5QrCode.start({ facingMode: 'environment' }, config, handleScan, () => undefined);
	}
	$: scanCount = user?.scanCount as Record<string, number>;

	async function handleScan(decodedText: string) {
		if (dialog?.open) {
			return;
		}
		user = await trpc().getUser.query(decodedText);
		dialog?.showModal();
	}

	onDestroy(() => {
		if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
			html5QrCode?.stop();
		}
	});
</script>

<section>
	{#if action === ''}
		<button on:click={() => (action = 'check-in')}>Check-In</button>
		<button on:click={() => (action = 'lunch')}>Lunch</button>
		<button on:click={() => (action = 'dinner')}>Dinner</button>
	{:else}
		<button on:click={() => (action = '')}>Back</button>
	{/if}
</section>
<div id="reader" />
<dialog bind:this={dialog}>
	{#if user === null}
		<p class="error">Could not find this user in the database.</p>
		<button type="button" on:click={() => dialog.close()}>Close</button>
	{:else if user.role === Role.HACKER && user.status !== Status.CONFIRMED}
		<p class="error">This user has not confirmed their attendance.</p>
		<button type="button" on:click={() => dialog.close()}>Close</button>
	{:else}
		<br />
		<details>
			<summary>{user.fullName}</summary>
			<UserCard {user} />
		</details>
		<p class={(scanCount[action] ?? 0) == 0 ? 'success' : 'error'}>
			This user has scanned for {action}
			{scanCount[action] ?? 0} times.
		</p>
		<form method="POST" action="?/scan" use:enhance>
			<button type="button" on:click={() => dialog.close()}>Cancel</button>
			<input type="hidden" name="magicLink" value={user.magicLink} />
			<button type="submit" name="action" value={action} on:click={() => dialog.close()}
				>Scan</button
			>
		</form>
	{/if}
</dialog>

<style>
	section {
		display: flex;
		flex-direction: column;
	}

	button {
		width: 100%;
		margin-bottom: 1rem;
	}

	.error {
		color: red;
	}

	.success {
		color: green;
	}
</style>
