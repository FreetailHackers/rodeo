<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;

	let hidden = true;
</script>

<div class="main-content">
	<form method="POST" action="?/createAccount" use:enhance>
		<h1>Create password</h1>
		<input type="hidden" name="token" value={data.token} />
		<p>
			Thank you for your incredible support of HackTX 2024! We truly appreciate the time and effort
			you've dedicated this weekend to making this event a success. To ensure you can easily log in
			later, please take a moment to set up your password here. An email will be sent to you after
			you create your password to verify your account. We look forward to meeting you this weekend!
		</p>

		<label for="password">
			Enter a new password (<a
				href="#/"
				on:click={(event) => {
					event.preventDefault();
					hidden = !hidden;
				}}
				>{#if hidden}show{:else}hide{/if}</a
			>):
		</label>
		<input
			type={hidden ? 'password' : 'text'}
			id="password"
			name="password"
			required
			minlength="8"
		/>
		<button type="submit">Create Account</button>
	</form>
</div>

<style>
	.main-content {
		margin: 0 auto;
		padding: 1rem;
	}

	label {
		display: block;
		margin-top: 1rem;
	}

	input {
		width: 100%;
	}

	button {
		margin-top: 1rem;
	}
</style>
