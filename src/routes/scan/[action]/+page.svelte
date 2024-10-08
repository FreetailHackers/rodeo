<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import UserCard from '$lib/components/user-card.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { Prisma } from '@prisma/client';
	import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
	import { onDestroy, onMount } from 'svelte';
	import Plot from 'svelte-plotly.js';

	export let data;

	let html5QrCode: Html5Qrcode;
	let dialog: HTMLDialogElement;

	let user: Prisma.UserGetPayload<{ include: { authUser: true; decision: true } }> | null = null;
	let totalScans: number;

	onMount(async () => {
		html5QrCode = new Html5Qrcode('reader');
		const config = { fps: 5, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };
		html5QrCode.start({ facingMode: 'environment' }, config, handleScan, () => undefined);
		totalScans = await trpc().users.getScanCount.query($page.params.action);
	});
	$: scanCount = user?.scanCount as Record<string, number>;

	async function handleScan(decodedText: string) {
		if (dialog?.open) {
			return;
		}
		user = await trpc().users.get.query(decodedText);
		totalScans = await trpc().users.getScanCount.query($page.params.action);
		dialog?.showModal();
	}

	onDestroy(() => {
		if (html5QrCode?.getState() === Html5QrcodeScannerState.SCANNING) {
			html5QrCode?.stop();
		}
	});

	function scanLogToTotalScans(scans: Prisma.ScanGetPayload<{ include: { user: true } }>[]) {
		return [
			{
				x: scans.map((scan) => scan.timestamp),
				y: scans.map((_scan, index) => index + 1),
			},
		];
	}

	function scanLogToUsersScanned(scans: Prisma.ScanGetPayload<{ include: { user: true } }>[]) {
		const usersScanned = new Set<string>();
		const timestamps = [];
		const usersScannedCount = [];
		for (const scan of scans) {
			if (!usersScanned.has(scan.userId)) {
				usersScanned.add(scan.userId);
				timestamps.push(scan.timestamp);
				usersScannedCount.push(usersScanned.size);
			}
		}
		return [{ x: timestamps, y: usersScannedCount }];
	}
</script>

<svelte:head>
	<title>Rodeo | Scan - {$page.params.action}</title>
</svelte:head>

<a href="/scan" on:click={() => html5QrCode.stop()}><button>Back</button></a>
<div id="reader" />

{#if data.scans !== null}
	<a href="?"><button class="stats">Hide stats</button></a>
	<Plot
		data={scanLogToTotalScans(data.scans)}
		layout={{
			xaxis: { title: 'Time' },
			yaxis: { title: 'Total Scans' },
			showlegend: false,
			margin: {
				t: 20,
				r: 0,
				b: 80,
				l: 50,
				pad: 5,
			},
			hovermode: 'x',
			hoverdistance: -1,
		}}
		fillParent="width"
		debounce={250}
	/>

	<Plot
		data={scanLogToUsersScanned(data.scans)}
		layout={{
			xaxis: { title: 'Time' },
			yaxis: { title: 'Users Scanned' },
			showlegend: false,
			margin: {
				t: 20,
				r: 0,
				b: 80,
				l: 50,
				pad: 5,
			},
			hovermode: 'x',
			hoverdistance: -1,
		}}
		fillParent="width"
		debounce={250}
	/>
{:else}
	<a href="?stats"><button class="stats">Show stats</button></a>
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
		<p class={(scanCount[$page.params.action] ?? 0) === 0 ? 'success' : 'error'}>
			This user has scanned for {$page.params.action}
			{scanCount[$page.params.action] ?? 0} times.
		</p>
		<p>{totalScans} users have scanned for this action.</p>
		<form method="POST" action="?/scan" use:enhance>
			<button type="button" on:click={() => dialog.close()}>Cancel</button>
			<input type="hidden" name="id" value={user.authUserId} />
			<button
				type="submit"
				name="action"
				value={$page.params.action}
				on:click={() => dialog.close()}>Scan</button
			>
		</form>
	{/if}
</dialog>

<style>
	button {
		width: 100%;
		margin-bottom: 1rem;
	}

	.stats {
		margin: 1rem 0 0 0;
	}

	.error {
		color: red;
	}

	.success {
		color: green;
	}
</style>
