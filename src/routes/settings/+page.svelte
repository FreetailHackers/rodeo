<script lang="ts">
	import { enhance } from '$app/forms';
	import { Modal, Content, Trigger } from 'sv-popup';

	export let data;

	let closeModal = false;
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>
<div class="container">

	<h3>Account Info</h3>
	<!-- Name and Email -->
	<div class="label-and-button" >
		<label for="name"
			>Name:
			{#if data.name}{data.name}{/if}
		</label>
		<Modal button={false} close={closeModal}>
			<Content>
				<div class="modal">
					<h3 class = "modal-header">Change Name  
						<img
							class = "close-button"
							src="/settings/close-button.png"
							alt="edit-name"
							draggable="false"
							on:click={() => (closeModal = true)}
							on:keypress={() => (closeModal = true)}
						/>
					</h3>
					<form method="POST" action="?/updateName" use:enhance>
						<div class="user-info">
							{#if data.name}
								<input type="text" id="name" name="name" value={data.name} />
							{:else}
								<input type="text" id="name" name="name" />
							{/if}
						</div>
						<button type="submit">Submit</button>
					</form>
				</div>
			</Content>
			<Trigger>
				<img
					src="/settings/edit-button.png"
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
	Please reset your password <a href="login/reset-password">here</a>
</div>

<style>
	.container {
		margin-left: 3%;
		padding: 3rem;
		background-color: white;
		min-width: 40vw;
		max-width: 40em;
	}
	.modal {
		border-radius: 1em;
		background-color: white;
		padding: 3% 3%;
		user-select: none;
	}
	.label-and-button {
		display: flex;
		justify-content: space-between;
		align-items: center;
		user-select: none;
	}

	input {
		margin-bottom: 1em;
	}
	label {
		user-select:text;
		display: inline-block;
	}

	/* select, */
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
	.modal-header {
		display: flex;
		justify-content: space-between;
		margin-top: unset;
		user-select: text;
	}
	.close-button{
		cursor: pointer;
	}
	hr {
		border: none;
		border-top: 1px solid #bbbbbb;
		margin: 1em 0em;
	}

	::placeholder {
		color: #bbbbbb;
	}

	/* #reset-password-buttons {
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
	} */

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
