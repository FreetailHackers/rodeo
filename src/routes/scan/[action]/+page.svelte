<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import UserCard from '$lib/components/user-card.svelte';
	import { trpc } from '$lib/trpc/client';
	import type { Prisma } from '@prisma/client';
	import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
	import { onDestroy, onMount } from 'svelte';
	import Plot from 'svelte-plotly.js';

	let { data } = $props();

	let html5QrCode: Html5Qrcode | undefined = $state();
	let dialog: HTMLDialogElement | undefined = $state();

	// Corrected UserWithScanCount: This type will include `scanCount` as `Prisma.JsonValue`
	// if `scanCount` is a field of type Json in your User model.
	type UserWithScanCount = Prisma.UserGetPayload<{
		include: { authUser: true; decision: true };
	}>;

	// Corrected user state to allow null for "not found" state
	let user: UserWithScanCount | undefined | null = $state();
	let totalScans: number = $state(0);

	onMount(() => {
		html5QrCode = new Html5Qrcode('reader');
		const config = { fps: 5, qrbox: { width: 250, height: 250 }, aspectRatio: 1 };
		html5QrCode.start({ facingMode: 'environment' }, config, handleScan, () => undefined);
		trpc()
			.users.getScanCount.query($page.params.action)
			.then((count: number) => {
				totalScans = count;
			});
	});
	// Corrected scanCount derived logic to handle Prisma.JsonValue from user.scanCount
	let scanCount = $derived(
		user &&
			user.scanCount &&
			typeof user.scanCount === 'object' &&
			user.scanCount !== null &&
			!Array.isArray(user.scanCount)
			? (user.scanCount as Record<string, number>)
			: {},
	);

	async function handleScan(decodedText: string) {
		if (dialog?.open) {
			console.log('Dialog is already open, ignoring scan');
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

<a href="/scan" onclick={() => html5QrCode && html5QrCode.stop()}><button>Back</button></a>
<div id="reader"></div>

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
	{#if user === undefined}
		<!-- Content for when user is undefined, e.g., a loading message -->
		<p>Loading user data...</p>
	{:else if user === null}
		<p class="error">Could not find this user in the database.</p>
		<button type="button" onclick={() => dialog?.close()}>Close</button>
	{:else if user.authUser.roles.includes('HACKER') && user.authUser.status !== 'CONFIRMED'}
		<p class="error">This user has not confirmed their attendance.</p>
		<button type="button" onclick={() => dialog?.close()}>Close</button>
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
			<button type="button" onclick={() => dialog?.close()}>Cancel</button>
			<input type="hidden" name="id" value={user.authUserId} />
			<button
				type="submit"
				name="action"
				value={$page.params.action}
				onclick={() => dialog?.close()}>Scan</button
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
