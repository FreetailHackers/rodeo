<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let hidden = true;
</script>

<svelte:head>
	<title>Formula Hacks | Reset Password</title>
</svelte:head>

<div class="topographic-background">
	{#if $page.url.search === ''}
		<div class="header"><h1>Reset Password</h1></div>
		<div class="form">
			<form method="POST" action="?/email" use:enhance>
				<label for="email">Enter the email you used to register:</label>
				<input id="email" name="email" type="email" required autocomplete="username" />
				<button>Continue</button>
			</form>
		</div>
	{:else if $page.url.search === '?submitted'}
		<p class="verify">
			If there is an account at the address you entered, an email has been sent with a single-use
			link to reset your password. It will expire in 10 minutes. Make sure to check your spam
			folder. If you do not receive an email, it may be because you signed up with a different
			address. <br /><br />
			Already changed password? <a href="/login">Login here!</a>
		</p>
	{:else if $page.url.search.startsWith('?token')}
		<div class="form">
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
		</div>
	{:else if $page.url.search === '?invalid'}
		<p class="verify">
			This password reset token either never existed or expired. You can <a
				href="/login/reset-password">request a new one</a
			>.
		</p>
	{/if}
</div>

<style>
	.topographic-background {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #303030;
		background-image: url('/Topographic Background.svg');
		background-size: 110%;
		min-height: calc(100vh - 159px);
	}

	.header {
		color: #f2ebd9;
		margin-top: 4vw;
		width: 40%;
		text-align: left;
		font-size: 2vw;
	}

	.form {
		width: 40%;
		padding-left: 0.5vw;
		padding-right: 0.5vw;
		padding-top: 0.5vw;
		padding-bottom: 0.5vw;
		margin-bottom: 10vw;
		background-color: #f2ebd9;
	}

	.verify {
		width: 40%;
		padding-left: 0.5vw;
		padding-right: 0.5vw;
		padding-top: 0.5vw;
		padding-bottom: 0.5vw;
		background-color: #f2ebd9;
	}

	button {
		margin-bottom: 0.5vw;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input {
		display: block;
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		.topographic-background {
			min-height: calc(100vh - 56px);
		}
	}
</style>
