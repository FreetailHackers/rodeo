<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let hidden = true;
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>
<div class="container">
	<!-- Name and Email -->
	<div class="user-info">
		<label class="form-heading" for="name">Name:</label>
		<input type="text" id="name" placeholder="Enter your name" />

		<label class="form-heading" for="email">Email:</label>
		<input type="email" id="email" placeholder="Enter your email" />
	</div>
	<div />

	<!-- Dietary Restrictions -->
	<hr />
	<div class="dietary-restrictions">
		<label class="form-heading" for="dietary">Dietary Restrictions</label>
		<select id="dietary">
			<option value="" disabled selected>Select one</option>
			<option value="none">None</option>
			<option value="vegetarian">Vegetarian</option>
			<option value="vegan">Vegan</option>
			<option value="gluten-free">Gluten-Free</option>
			<option value="halal">Halal</option>
			<option value="kosher">Kosher</option>
		</select>
	</div>

	<!-- Reset Password -->
	<hr />
	<h3 class="form-heading">Reset Password</h3>
	<form method="POST" action="?/reset" use:enhance>
		<label class="form-heading" for="password">
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
			placeholder="Old Password"
		/>
		<input
			type={hidden ? 'password' : 'text'}
			id="password"
			name="password"
			required
			minlength="8"
			placeholder="New Password"
			autocomplete="new-password"
		/>
		<input type="hidden" name="token" value={$page.url.searchParams.get('token')} />
		<div id="reset-password-buttons">
			<button id="reset-password-buttons-cancel" type="reset">Cancel</button>
			<button type="submit">Reset</button>
		</div>
	</form>
</div>

<style>
	.container {
		margin-left: 3%;
		padding: 3rem;
		background-color: white;
		min-width: 40vw;
		max-width: 40em;
	}

	input {
		margin-bottom: 1em;
	}
	label {
		display: inline-block;
		margin-bottom: 1em;
	}

	input,
	select {
		font-size: 1rem;
		width: 100%;

		height: 3em;
		border-radius: 15px;
		border: 1px solid #bbbbbb;
		padding: 1em;
	}

	hr {
		border: none;
		border-top: 1px solid #bbbbbb;
		margin-bottom: 1em;
	}

	::placeholder {
		color: #bbbbbb;
	}

	#reset-password-buttons {
		display: flex;
		justify-content: end;
		gap: 1em;
	}
	#reset-password-buttons #reset-password-buttons-cancel {
		background-color: white;
		border-color: #7970ff;
		border: 1px solid #7970ff;
		color: #7970ff;
	}

	select {
		appearance: none;
		color: #bbbbbb;
		padding: 0 1em;
		margin-bottom: 1em;

		background-image: url('/static/settings/selection-arrow.png');
		background-repeat: no-repeat;
		background-position: right center;
		padding-right: 1em;
		background-origin: content-box;
	}
	select option {
		color: black;
	}

	@media only screen and (max-width: 767px) {
		.container {
			padding: 1rem;
			box-shadow: none;
		}

		button {
			width: 100%;
		}
	}
</style>
