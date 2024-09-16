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
		<label for="name"
			><b>
				{#if data.name}
					{data.name}
				{:else}
					You have not set a name yet.
				{/if}</b
			>
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
						<button class="user-button" type="submit">Submit</button>
					</form>
				</div>
			</Content>
			<Trigger>
				<img
					id="edit-button"
					src="/edit-button.png"
					alt="edit-name"
					draggable="false"
					on:click={() => (closeModal = false)}
					on:keypress={() => (closeModal = false)}
				/>
			</Trigger>
		</Modal>
	</div>
	<label for="email">{data.email}</label>
	<hr />
	<p>
		If you would like to reset your password, you can do so <a href="login/reset-password">here</a>.
	</p>
</div>

<style>
	.container {
		padding: 3rem;
		max-width: 50em;
	}

	input {
		width: 100%;
		margin-bottom: 1em;
	}

	@media only screen and (max-width: 767px) {
		.container {
			padding: 1rem;
			box-shadow: none;
		}

		#edit-button {
			margin-right: 1em;
		}
	}
</style>
