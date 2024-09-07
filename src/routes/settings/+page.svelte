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
		<label for="name">Name:</label>
		<input type="text" id="name" value="Name Name" />

		<label for="email">Email:</label>
		<input type="email" id="email" value="namename@gmail.com" />
	</div>

	<!-- Dietary Restrictions -->
	<hr />
	<h3>Dietary Restrictions</h3>
	<div class="dietary-restrictions">
		<label for="dietary">Dietary Restrictions:</label>
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
	<h3>Reset Password</h3>
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

<style>
	.container {
		margin-left: 200px;
		padding: 3rem;
		background-color: #fff;
		max-width: 50vw;
	}

	label {
		margin-bottom: 0.5rem;
	}

	input,
	select {
		padding: 0.8rem;
		border-radius: 8px;
		border: 1px solid #ccc;
		font-size: 1rem;
		width: 100%;
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
