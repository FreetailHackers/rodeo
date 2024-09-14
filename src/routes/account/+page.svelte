<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';

	export let data;
	let canvas: HTMLCanvasElement;

	onMount(() => {
		QRCode.toCanvas(canvas, data.user.id, {
			width: 300,
		});
	});
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="container">
	<!-- Left Section with Forms -->
	<div class="left-section">
		<!-- Name and Food Group -->
		<h2>Name Name</h2>
		<p>Email: namename@gmail.com</p>
		<hr style="color: #EBEBEB" />
		<p>Food Group: #1</p>
		<p>Dietary Restrictions: None</p>
		<hr style="color: #BBBBBB" />
		<!-- My Team Section -->
		{#if !data.team}
			<form method="POST" action="?/createTeam" use:enhance>
				<h2>Create a Team</h2>
				<input type="text" id="teamName" name="teamName" placeholder="Enter Team Name" required />
				<button type="submit">Create Team</button>
			</form>
		{:else}
			<h2>Your Team: {data.team.name}</h2>
			<p>Team Members:</p>
			<ul>
				{#each data.team.members as member}
					<li>{member.name} - {member.email}</li>
				{/each}
			</ul>

			<!-- Update devpost url frm -->
			<h3>My Project</h3>

			<form method="POST" action="?/updateDevpost" use:enhance>
				<label for="teamDevpost">Devpost Link:</label>

				<input
					type="text"
					id="devpostUrl"
					name="devpostUrl"
					value={data.team.devpostUrl}
					placeholder="Paste the project link here"
				/>

				<button type="submit">Save</button>
			</form>

			<!-- Invitations -->

			<form method="POST" action="?/inviteUser">
				<h3>Invite a new member</h3>
				<input type="text" id="inviteEmail" name="inviteEmail" placeholder="Enter email" required />
				<button type="submit">Send Invitation</button>
			</form>

			{#if data.invitations.length > 0}
				<h4>Pending Invitations:</h4>
				<ul>
					{#each data.invitations as invite}
						<li>{invite.email}</li>
					{/each}
				</ul>
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
		</div>
	</div>
</div>

<style>
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
		padding: 1rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 15px;
		background: url(static/hackerid/hackerid.svg);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	/* select, */
	input {
		padding: 0.5rem;
		border-radius: 5px;
		border: 1px solid #ccc;
	}

	button {
		background-color: #6c63ff;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #5548c8;
	}

	/* Mobile Devices */
	@media only screen and (max-width: 767px) {
		.container {
			flex-direction: column;
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
