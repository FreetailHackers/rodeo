<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="container">
	<!-- Name and Email -->
	<form method="POST" action="?/updateName" use:enhance>
		<div class="user-info">
			<label for="name">Name:</label>
			{#if data.name}
				<input type="text" id="name" name="name" value={data.name} />
			{:else}
				<input type="text" id="name" name="name" />
			{/if}

			<label for="email">Email: {data.email}</label>
		</div>
		<button type="submit">Submit</button>
	</form>

	Please reset your password<a href="login/reset-password">here</a>
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

	/* select, */
	input {
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
