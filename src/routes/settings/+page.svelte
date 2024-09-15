<script lang="ts">
	import { enhance } from '$app/forms';
	// @ts-expect-error: The 'sv-popup' module does not have type definitions, so we are temporarily using 'any' type.
	import { Modal, Content, Trigger } from 'sv-popup';

	export let data;

	let closeModal = false;
</script>

<svelte:head>
	<title>Rodeo | Settings</title>
</svelte:head>
<div class="container">
	<h2>Settings</h2>
	<!-- Name and Email -->
	<div class="label-and-button">
		<label for="name">
			Name:
			{#if data.name}
				{data.name}
			{:else}
				You have not set a name yet.
			{/if}
		</label>
		<Modal button={false} close={closeModal}>
			<Content>
				<div class="modal">
					<h2 class="modal-header">Change Name</h2>
					<img
						class="close-button"
						src="/close-button.png"
						alt="close edit name"
						draggable="false"
						on:click={() => (closeModal = true)}
						on:keypress={() => (closeModal = true)}
					/>
					<form method="POST" action="?/updateName" use:enhance>
						<div class="user-info">
							{#if data.name}
								<input
									type="text"
									id="name"
									name="name"
									placeholder="Insert your name"
									value={data.name}
								/>
							{:else}
								<input type="text" id="name" name="name" placeholder="Insert your name" />
							{/if}
						</div>
						<button type="submit">Submit</button>
					</form>
				</div>
			</Content>
			<Trigger>
				<img
					src="/edit-button.png"
					alt="edit-name"
					draggable="false"
					on:click={() => (closeModal = false)}
					on:keypress={() => (closeModal = false)}
				/>
			</Trigger>
		</Modal>
	</div>
	<br />
	<label for="email">Email: {data.email}</label>
	<hr />
	<p>
		If you would like to reset your password, you can do so <a href="login/reset-password">here</a>.
	</p>
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
		user-select: text;
		display: inline-block;
	}

	input {
		padding: 0.8rem;
		border-radius: 8px;
		border: 1px solid #ccc;
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
		margin: 1em 0em;
	}

	::placeholder {
		color: #bbbbbb;
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
