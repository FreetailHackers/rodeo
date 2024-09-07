<script lang="ts">
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';

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
		<p>Food Group: #1</p>
		<p>Dietary Restrictions: None</p>

		<!-- My Project Form -->
		<h3>My Project</h3>
		<form>
			<label for="track">Track:</label>
			<select id="track" name="track">
				<option value="" disabled selected>Select one</option>
				<option value="track1">Track 1</option>
				<option value="track2">Track 2</option>
			</select>

			<label for="devpost-link">Devpost Link:</label>
			<input type="text" id="devpost-link" placeholder="Paste the project link here" />

			<button type="button">Save</button>
		</form>

		<!-- My Team Section -->
		<h3>My Team</h3>
		<div class="team-members">
			<p>Team Member 1 - email1@gmail.com</p>
			<p>Team Member 2 - email2@gmail.com</p>
			<p>Team Member 3 - email3@gmail.com</p>
		</div>
	</div>

	<!-- Right Section with Hacker ID -->
	<div class="right-section">
		<h3>My Hacker ID</h3>
		<div class="driver-div">
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
		margin-left: 16rem;
		gap: 3rem;
	}

	.left-section {
		flex-basis: 30rem;
		flex-shrink: 0;
	}

	.right-section {
		flex-basis: 30%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.driver-div {
		padding: 1rem 2rem;
		box-shadow: 4px 4px 16px 0px #00000040;
		border-radius: 10px;
		margin-top: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1rem;
	}

	input,
	select {
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
