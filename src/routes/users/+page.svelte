<script lang="ts">
	import { enhance } from '$app/forms';
	import Dropdown from '$lib/components/dropdown.svelte';
	import Users from '$lib/components/users.svelte';
	import type { ActionData } from './$types';

	export let data;
	export let form: ActionData;
</script>

<h1>Add New User</h1>
<form method="POST" action="?/create" use:enhance>
	<label for="fullName">Name</label>
	<input type="text" name="fullName" id="fullName" placeholder="J. Random Person" required />
	<label for="email">Email</label>
	<input type="email" name="email" id="email" placeholder="email@example.com" required />
	<Dropdown
		label="Role"
		name="role"
		options={['HACKER', 'ADMIN', 'ORGANIZER', 'MENTOR', 'JUDGE', 'VOLUNTEER', 'SPONSOR']}
		value=""
		required
	/>
	<button type="submit" value="Create">Create User</button>
</form>
{#if form}
	<p>{form}</p>
{/if}

<h1>Master Database</h1>
<Users users={data.users} actions={['accept', 'confirm']} />
