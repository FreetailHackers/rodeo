<script>
	import { enhance } from '$app/forms';

	export let data;
</script>

{#if data.token}
	<form method="POST" use:enhance>
		<label for="password">Enter a new password:</label>
		<input type="password" id="password" name="password" required minlength="8" />
		<input type="hidden" name="token" value={data.token} />
		<button type="submit">Reset</button>
	</form>
{:else}
	<p>
		That password reset token either never existed or expired. You can <a
			href="/login/reset-password">request a new one</a
		>.
	</p>
{/if}

<style>
	input {
		display: block;
		margin: 0.5rem 0 1rem 0;
	}
</style>
