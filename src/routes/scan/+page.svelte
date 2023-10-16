<script lang="ts">
	import { enhance } from '$app/forms';
	import UserCard from '$lib/components/user-card.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { Prisma } from '@prisma/client';
	import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
	import { onDestroy } from 'svelte';

	export let data;

	let html5QrCode: Html5Qrcode;
	let dialog: HTMLDialogElement;

	let action = '';
	let user: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }> | null = null;
	let totalScans: number;

	async function scan(action: string) {
		if (action === '') {
			if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
				html5QrCode?.stop();
			}
		} else {
			html5QrCode = new Html5Qrcode('reader');
			const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };
			html5QrCode.start({ facingMode: 'environment' }, config, handleScan, () => undefined);
			totalScans = await trpc().users.getScanCount.query(action);
		}
	}
	$: scan(action);
	$: scanCount = user?.scanCount as Record<string, number>;

	async function handleScan(decodedText: string) {
		if (dialog?.open) {
			return;
		}
		user = await trpc().users.get.query(decodedText);
		totalScans = await trpc().users.getScanCount.query(action);
		dialog?.showModal();
	}

	onDestroy(() => {
		if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
			html5QrCode?.stop();
		}
	});
</script>

<svelte:head>
	<title>Rodeo | Scan</title>
</svelte:head>

<section>
	{#if action === ''}
		{#if data.settings.scanActions.length === 0}
			<i>No scan actions are configured. Add some in the <a href="/admin">admin panel</a>.</i>
		{/if}
		{#each data.settings.scanActions as option}
			<button on:click={() => (action = option)}>{option}</button>
		{/each}
	{:else}
		<button on:click={() => (action = '')}>Back</button>
	{/if}
</section>
<div id="reader" />
{#if action !== ''}
	<p>{totalScans} users have scanned for this action.</p>
{/if}
<dialog bind:this={dialog}>
	{#if user === null}
		<p class="error">Could not find this user in the database.</p>
		<button type="button" on:click={() => dialog.close()}>Close</button>
	{:else if user.authUser.roles.includes('HACKER') && user.authUser.status !== 'CONFIRMED'}
		<p class="error">This user has not confirmed their attendance.</p>
		<button type="button" on:click={() => dialog.close()}>Close</button>
	{:else}
		<br />
		<details>
			<summary>{user.authUser.email}</summary>
			<UserCard {user} questions={data.questions} />
		</details>
		<p class={(scanCount[action] ?? 0) === 0 ? 'success' : 'error'}>
			This user has scanned for {action}
			{scanCount[action] ?? 0} times.
		</p>
		<p>{totalScans} users have scanned for this action.</p>
		<form method="POST" action="?/scan" use:enhance>
			<button type="button" on:click={() => dialog.close()}>Cancel</button>
			<input type="hidden" name="id" value={user.authUserId} />
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
