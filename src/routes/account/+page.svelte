<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	// @ts-expect-error: The 'sv-popup' module does not have type definitions, so we are temporarily using 'any' type.
	import { Modal, Content, Trigger } from 'sv-popup';
	export let data;

	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.id, {
			scale: 10,
		});

		canvas.style.width = '64%';
		canvas.style.height = 'auto';
	});
	let closeModal = false;
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="container">
	<!-- Left Section with Forms -->
	<div class="left-section">
		<!-- Name and Food Group -->
		<h2>{data.name}</h2>
		<p>Email: {data.user.email}</p>
		<hr style="color: #EBEBEB" />
		<p>Food Group: #1</p>
		<p>Dietary Restrictions: None</p>
		<hr style="color: #ccc" />
		<!-- My Team Section -->
		{#if !data.team}
			<form method="POST" action="?/createTeam" use:enhance>
				<h2>Create a Team</h2>
				<input type="text" id="teamName" name="teamName" placeholder="Enter Team Name" required />
				<button class="user-button" type="submit">Create Team</button>
			</form>
		{:else}
			<!-- Update devpost url frm -->
			<h3>My Project</h3>

			<form method="POST" action="?/updateDevpost" use:enhance>
				<label for="track-select">Track:</label>
				<select name="track">
					<option value="">Select one</option>
					<hr />
					<optgroup label="General Tracks">
						<option value="abc">abc</option>
						<option value="abc">abc</option>
						<option value="abc">abc</option>
					</optgroup>
					<hr />
					<optgroup label="AI Tracks">
						<option value="abc">abc</option>
						<option value="abc">abc</option>
						<option value="abc">abc</option>
					</optgroup>
				</select>
				<label for="teamDevpost">Devpost Link:</label>

				<input
					type="text"
					id="devpostUrl"
					name="devpostUrl"
					value={data.team.devpostUrl}
					placeholder="Paste the project link here"
				/>

				<div class="cancel-save">
					<p>Last saved on 8/11/2024 at 1:04 PM</p>
					<button class="user-button negative-button" type="reset">Cancel</button>
					<button class="user-button" type="submit">Save</button>
				</div>
			</form>

			<hr />

			<!-- Team Members -->
			<h2 class="label-and-button">
				My Team: {data.team.name}
				<Modal button={false} close={closeModal}>
					<Content>
						<div class="modal">
							<form method="POST" action="?/inviteUser">
								<h3 class="modal-header">
									Invite a new member
									<img
										class="close-button"
										src="/close-button.png"
										alt="close add team member"
										draggable="false"
										on:click={() => (closeModal = true)}
										on:keypress={() => (closeModal = true)}
									/>
								</h3>
								<input
									type="text"
									id="inviteEmail"
									name="inviteEmail"
									placeholder="Enter email"
									required
								/>
								<p>*You can only invite users that have signed up on Rodeo*</p>
								<button id="modalSubmit" type="submit">Send Invitation</button>
							</form>
						</div>
					</Content>
					<Trigger>
						<img
							src="/add-button.png"
							alt="add team member"
							draggable="false"
							on:click={() => (closeModal = false)}
							on:keypress={() => (closeModal = false)}
						/>
					</Trigger>
				</Modal>
			</h2>
			{#each data.team.members as member}
				<div class="member">
					<div class="member-info">
						<p>{member.name}</p>
						<p>{member.email}</p>
					</div>
				</div>
			{/each}
			{#if data.invitations.length > 0}
				{#each data.invitations as invite}
					<div class="member">
						<div class="member-info">
							<p>name</p>
							<p>{invite.email}</p>
						</div>
						<p><b>Pending</b></p>
					</div>
				{/each}
			{/if}

			<!-- Leave team -->
			<form method="POST" action="?/leaveTeam">
				<button type="submit">Leave Team</button>
			</form>
		{/if}
	</div>

	<!-- Right Section with Hacker ID -->
	<div class="right-section">
		<h2>My Hacker ID</h2>
		<div class="id-card">
			<canvas bind:this={canvas} id="qrcode" />
			<img src="hacker-id/background.svg" alt="hacker id-card" />
		</div>
	</div>
</div>

<style>
	/* #modalSubmit {
		margin-bottom: 1rem;
	} */

	hr {
		margin: 1em 0;
	}

	.container {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap-reverse;
		padding: 3rem;
		gap: 3rem;
	}

	.left-section {
		flex-basis: 30rem;
		flex-shrink: 0;
		flex-grow: 1;
	}

	.right-section {
		flex-basis: 30%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.id-card {
		position: relative;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 15px;
		min-width: 13rem;
	}
	.id-card img {
		display: block;
		top: 0;
		left: 0;
		width: 400px;
	}
	.id-card #qrcode {
		position: absolute;
		object-fit: contain;
		margin: 18%;
		margin-top: 23%;
		border-radius: 10%;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}
	.modal form {
		margin: unset;
	}
	.member-info {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	/* select, */
	.cancel-save {
		display: flex;
		justify-content: end;
		align-items: center;
		gap: 1em;
	}

	.member {
		display: flex;
		/* justify-content: space-between; */
		flex-direction: column; /*i think*/
		position: relative;
	}

	.member::after {
		content: '';
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: black;
		position: absolute;
	}

	.member:last-child::after {
		content: none;
	}

	/* Mobile Devices */
	@media only screen and (max-width: 767px) {
		.container {
			flex-direction: column-reverse;
			align-items: center;
		}

		.left-section,
		.right-section {
			width: 100%;
		}

		.right-section {
			margin-top: 2rem;
		}
	}
</style>
