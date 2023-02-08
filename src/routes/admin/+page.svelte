<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let buttonText = 'Save';
</script>

<h1>Admin Panel</h1>

<form
	method="POST"
	use:enhance={() => {
		buttonText = 'Saving...';
		return async ({ update }) => {
			update({ reset: false });
			// 100 ms delay so people actually see the "Saving..." text
			await new Promise((r) => setTimeout(r, 100));
			buttonText = 'Saved!';
		};
	}}
>
	<Toggle name="applicationOpen" label="Accept new applications" checked={data.applicationOpen} />
	<button type="submit">{buttonText}</button>
</form>
<noscript>
	{#if form}
		<p>{form}</p>
	{/if}
</noscript>

<style>
	button {
		margin-top: 1rem;
		width: 100%;
	}
</style>
