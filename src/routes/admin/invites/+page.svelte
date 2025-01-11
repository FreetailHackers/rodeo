<script lang="ts">
	import { enhance } from '$app/forms';
	import Toggle from '$lib/components/toggle.svelte';

	export let data;
</script>

<svelte:head>
	<title>Rodeo | Admin - Email Templates</title>
</svelte:head>

<form
	method="POST"
	action="?/inviteToRodeo"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<div class="toggle-container">
		<Toggle
			name="inviteUsersIsHTML"
			label="Use HTML (Default: Markdown)"
			bind:checked={data.settings.inviteUsersIsHTML}
		/>
	</div>

	<select name="role" class="role">
		<option value="HACKER">HACKER</option>
		<option value="ADMIN">ADMIN</option>
		<option value="ORGANIZER">ORGANIZER</option>
		<option value="JUDGE">JUDGE</option>
		<option value="VOLUNTEER">VOLUNTEER</option>
		<option value="SPONSOR">SPONSOR</option>
	</select>

	<textarea
		name="emailsToInvite"
		id="emailsToInvite"
		placeholder="Write one email per line, like this:&#13;email1@gmail.com&#13;email2@gmail.com&#13;email3@gmail.com"
	/>

	<button type="submit">Send</button>
</form>

<style>
	.toggle-container {
		margin-bottom: 1rem;
	}

	.role {
		width: 100%;
		margin-bottom: 1rem;
	}

	textarea {
		width: 100%;
		height: 10rem;
		margin-bottom: 1rem;
	}

	button {
		width: 100%;
	}
</style>
