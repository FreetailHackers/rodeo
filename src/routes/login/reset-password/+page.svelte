<script>
	import { enhance } from '$app/forms';

	export let form;
</script>

{#if form === null}
	<h1>Reset Password</h1>
	<form method="POST" use:enhance>
		<label for="email">Enter the email you used to register:</label>
		<input id="email" name="email" type="email" required />
		<button>Continue</button>
	</form>
{:else if form === undefined}
	<!-- Abuse the fact that ActionData is null before a form action is
	triggered cuz I don't wanna write a separate route for the success
	message -->
	<p>
		If there is an account at the address you entered, an email has been sent with a single-use link
		to reset your password. It will expire in 10 minutes. Make sure to check your spam folder. If
		you do not receive an email, it may be because you entered the wrong address or because you
		signed up with a different address or third-party service like Google.
	</p>
	<a href="/">Back to home</a>
{/if}

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
