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

		if (
			data.user !== undefined &&
			(!data.user.roles.includes('HACKER') ||
				data.user.roles.length > 1 ||
				data.user.status === 'CONFIRMED')
		) {
			canvas.style.width = '64%';
			canvas.style.height = 'auto';
		}
	});
	let closeModal = false;
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="container">
	<!-- Left Section with Forms -->
	{#if data.user.roles.includes('HACKER')}
		<div class="left-section">
			{#if data.lunchGroup}
				<p><b>Lunch Group</b>: {data.lunchGroup}</p>
			{/if}
			<p><b>Email</b>: {data.user.email}</p>
			<hr />
			{#if !data.team}
				<form method="POST" action="?/createTeam" use:enhance>
					<h3>Create a Team</h3>
					<input
						type="text"
						id="teamName"
						name="teamName"
						placeholder="Enter Team Name"
						pattern="^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$"
						maxlength="50"
						required
					/>
					<button class="user-button" type="submit">Create Team</button>
				</form>
			{:else}
				<h3 class="label-and-button">
					Team: {data.team.name}
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
										type="email"
										id="inviteEmail"
										name="inviteEmail"
										placeholder="Enter email"
										required
									/>
									<p>
										You can only invite users who have a Rodeo account and are not already part of a
										team.
									</p>
									<button id="modalSubmit" class="user-button" type="submit">Send Invitation</button
									>
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
				</h3>
				{#each data.team.members as member}
					<div class="member">
						<div class="member-info">
							<p>{member.authUser.email}</p>
						</div>
					</div>
				{/each}
				{#if data.invitations.length > 0}
					{#each data.invitations as invite}
						{#if invite.status !== 'ACCEPTED'}
							<div class="member">
								<div class="member-info">
									<p>{invite.email}</p>
								</div>
								<p><b>{invite.status}</b></p>
							</div>
						{/if}
					{/each}
				{/if}

				<form method="POST" action="?/leaveTeam">
					<button class="user-button" type="submit">Leave Team</button>
				</form>
			{/if}
		</div>
	{/if}
	{#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED')}
		<!-- Right Section with Hacker ID -->
		<div class="right-section">
			<h3>My Hacker ID</h3>

			<div class="id-card">
				<canvas bind:this={canvas} id="qrcode" />
				<img src="hacker-id/background.png" alt="hacker id-card" />
			</div>
		</div>
	{/if}
</div>

<style>
	h3 {
		margin-bottom: 0.5em;
	}

	.container {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap-reverse;
		padding: 3rem;
		gap: 3rem;
	}

	.left-section:only-child {
		max-width: 50rem;
	}

	.left-section {
		flex-grow: 1;
	}

	.right-section:only-child {
		width: 100%;
	}

	.right-section {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.id-card {
		position: relative;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: var(--border-radius);
	}

	.id-card img {
		display: block;
		top: 0;
		left: 0;
		object-fit: cover;
		width: 100%;
		height: 60vh;
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

	input {
		width: 100%;
	}

	.modal form {
		margin: unset;
	}

	.member {
		display: flex;
		justify-content: space-between;
		position: relative;
	}

	.member::after {
		content: '';
		left: 0;
		right: 0;
		bottom: 0;
		height: 1px;
		background: var(--grey);
		position: absolute;
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
