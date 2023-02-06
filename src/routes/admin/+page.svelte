<script lang="ts">
	import Toggle from '$lib/components/toggle.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<h1>Admin Panel</h1>

<form method="POST">
	<Toggle name="applicationOpen" label="Accept new applications" checked={data.applicationOpen} />
	<button type="submit">Save</button>
</form>
<p>
	{#if form}
		{form}
	{/if}
</p>

<style>
	button {
		margin-top: 1rem;
		width: 100%;
	}
</style>
