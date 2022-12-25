<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let email = '';
</script>

{#if data.user}
	<h1>Welcome back, {data.user.email}</h1>
	<form method="POST" action="?/logout" use:enhance>
		<button>Logout</button>
	</form>
{:else}
	<h1>Welcome to Min-Max</h1>
	<form method="POST" action="?/login" use:enhance>
		<label for="email">To get started, enter your email! </label>
		<input bind:value={email} type="email" name="email" placeholder="Email" />
		<button>Register</button>
	</form>
	{#if form}
		<p>{form}</p>
	{/if}
{/if}
