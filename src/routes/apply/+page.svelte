<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let { name, major } = data.user;
</script>

<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="name">Name </label>
	<input bind:value={name} type="name" name="name" placeholder="John Doe" />
	<label for="major">Major</label>
	<input bind:value={major} type="major" name="major" placeholder="Underwater Basket Weaving" />
	<button>Save</button>
</form>
{#if form}
	<p>{form}</p>
{/if}

<style>
	form {
		display: flex;
		flex-direction: column;
	}

	input {
		padding-left: 0.5rem;
	}
</style>
