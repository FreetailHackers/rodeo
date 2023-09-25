<script>
	import { enhance } from '$app/forms';
</script>

<svelte:head>
	<title>Rodeo | Unverified Email</title>
</svelte:head>

<p>
	You must verify your email before accessing this page. Please check your inbox for a verification
	link. If you did not get one (please remember to check spam), you can request a new one below.
</p>

<form method="POST" use:enhance>
	<button type="submit">Resend Verification Email</button>
</form>
