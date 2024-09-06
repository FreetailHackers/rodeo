<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let hidden = true;
</script>

<svelte:head>
	<title>Rodeo | Reset Password</title>
</svelte:head>

<div class="auth-content">
	<img class="bat" src="/auth-assets/bat.svg" alt="Freetail Bat" />
	{#if $page.url.search === ''}
		<h1>Reset Password</h1>
		<form method="POST" action="?/email" use:enhance>
			<label for="email">Enter the email you used to register:</label>
			<input id="email" name="email" type="email" required autocomplete="username" />
			<div class="button-wrapper"><button>Send Link</button></div>
		</form>
	{:else if $page.url.search === '?submitted'}
		<h1>Check your inbox</h1>
		<p class="verify">
			If there is an account at the address you entered, an email has been sent with a single-use
			link to reset your password. It will <b>expire in 10 minutes</b>. Make sure to check your spam
			folder. If you do not receive an email, it may be because you signed up with a different
			address. <br /><br />
			Already changed password?
		</p>
		<div class="button-wrapper">
			<button><a href="/login">Login here!</a></button>
		</div>
	{:else if $page.url.search.startsWith('?token')}
		<h1>Resetting your password</h1>
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
		<p class="verify">
			This password reset token either never existed or expired. You can <a
				href="/login/reset-password">request a new one</a
			>.
		</p>
	{/if}
</div>

<style>
	a {
		all: unset;
	}

	p {
		margin-bottom: 0;
	}

	h1 {
		text-align: center;
		margin: 15px 0px;
	}

	form {
		padding: 1em 1em 0 1em;
	}

	.verify {
		padding: 1em;
	}

	label {
		display: block;
	}

	input {
		color: grey;
		display: block;
		margin-top: 1em;
	}
</style>
