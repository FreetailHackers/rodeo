<script lang="ts">
	import { enhance } from '$app/forms';
	export let data;

	let releaseConfirm = false;
</script>

<svelte:head>
	<title>Rodeo | Admin - Admissions</title>
</svelte:head>

<h2>Pending Decisions</h2>
<form
	method="POST"
	action="?/release"
	use:enhance={({ cancel }) => {
		if (!releaseConfirm) {
			cancel();
			releaseConfirm = true;
		} else {
			releaseConfirm = false;
		}
	}}
>
	{#if releaseConfirm}
		<button type="submit" id="release">Are you sure? This is irreversible!</button>
	{:else}
		<button type="submit" id="release"
			>Release all {Object.values(data.decisions).reduce((sum, array) => sum + array.length, 0)} pending
			decisions</button
		>
	{/if}
</form>

<style>
	form {
		padding-top: 10px;
	}

	button {
		margin-top: 30px;
		width: 100%;
	}

	#release {
		font-weight: bold;
		margin-top: 0;
		padding-top: 0;
		text-transform: uppercase;
	}
</style>
