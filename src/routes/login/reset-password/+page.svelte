<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let hidden = true;
</script>

<svelte:head>
	<title>Rodeo | Reset Password</title>
</svelte:head>

{#if $page.url.search === ''}
	<h1>Reset Password</h1>
	<form method="POST" action="?/email" use:enhance>
		<label for="email">Enter the email you used to register:</label>
		<input id="email" name="email" type="email" required autocomplete="username" />
		<button>Continue</button>
	</form>
{:else if $page.url.search === '?submitted'}
	<p>
		If there is an account at the address you entered, an email has been sent with a single-use link
		to reset your password. It will expire in 10 minutes. Make sure to check your spam folder. If
		you do not receive an email, it may be because you signed up with a different address.
	</p>
{:else if $page.url.search.startsWith('?token')}
	<form method="POST" action="?/reset" use:enhance>
		<label for="password">
			<!-- svelte-ignore a11y-invalid-attribute -->
			Enter a new password (<a href="javascript:;" on:click={() => (hidden = !hidden)}>
				{#if hidden}show{:else}hide{/if}</a
			>):
		</label>
		<input
			type={hidden ? 'password' : 'text'}
			id="password"
			name="password"
			required
			minlength="8"
			autocomplete="new-password"
		/>
		<input type="hidden" name="token" value={$page.url.searchParams.get('token')} />
		<button type="submit">Reset</button>
	</form>
{:else if $page.url.search === '?invalid'}
	<p>
		This password reset token either never existed or expired. You can <a
			href="/login/reset-password">request a new one</a
		>.
	</p>
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
