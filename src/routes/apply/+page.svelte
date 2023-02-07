<script lang="ts">
	import { enhance } from '$app/forms';
	import { trpc } from '$lib/trpc/client';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const nullToUndefined = (object: object) => {
		return Object.fromEntries(
			Object.entries(object).map(([key, value]) => [key, value === null ? undefined : value])
		);
	};

	let { name, major } = data.user;
	$: user = { name, major };

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	let submitButton: HTMLButtonElement;
</script>

{#if data.applicationOpen}
	<form
		method="POST"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
		on:input={() => {
			submitButton.disabled = true;
			submitButton.textContent = 'Autosaving...';
			if (debounceTimer !== undefined) {
				clearTimeout(debounceTimer);
			}
			debounceTimer = setTimeout(async () => {
				debounceTimer = undefined;
				await trpc().setUser.mutate(nullToUndefined(user));
				submitButton.disabled = false;
				submitButton.textContent = 'Saved!';
			}, 1000);
		}}
		autocomplete="off"
	>
		<label for="name">Name </label>
		<input bind:value={name} type="name" name="name" placeholder="John Doe" />
		<label for="major">Major</label>
		<input bind:value={major} type="major" name="major" placeholder="Underwater Basket Weaving" />
		<button bind:this={submitButton}>Save</button>
	</form>
	<noscript>
		{#if form}
			<p>{form}</p>
		{/if}
	</noscript>
{:else}
	<p>Sorry, applications have closed.</p>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}
</style>
