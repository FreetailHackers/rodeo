<script lang="ts">
	import { enhance } from '$app/forms';

	let hidden = true;
</script>

<h1>Register</h1>
<form
	method="POST"
	use:enhance={() => {
		return async ({ update }) => {
			update({ reset: false });
		};
	}}
>
	<label for="email">Email</label>
	<input type="email" id="email" name="email" required />
	<!-- svelte-ignore a11y-invalid-attribute -->
	<label for="password"
		>Password (<a href="javascript:;" on:click={() => (hidden = !hidden)}>show</a>)</label
	>
	<input type={hidden ? 'password' : 'text'} id="password" name="password" required minlength="8" />
	<button>Continue</button>
</form>

<style>
	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}
</style>
