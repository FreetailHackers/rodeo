<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let name = data.user?.name;
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<p>Personal Information</p>
	<label for="name">Name </label>
	<input bind:value={name} type="name" name="name" placeholder="John Doe" />
	<button>Save</button>
</form>
{#if form}
	<p>{form}</p>
{/if}
