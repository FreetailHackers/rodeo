<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { Modal, Content, Trigger } from 'sv-popup';
	import QRCodeStyling from 'qr-code-styling';

	let { data } = $props();

	function downloadPass(passData: any, filename: string) {
		if (isButtonsDisabled || passData === undefined) return;
		const blob = new Blob([new Uint8Array(passData.data)], {
			type: passData.mimeType,
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	let qrCodeContainer = $state() as HTMLDivElement;
	let closeModal = $state(false);

	// button is disabled until hackathon start date (if set)
	const startDate = data.settings?.hackathonStartDate;
	const isButtonsDisabled = startDate ? new Date() < new Date(startDate) : false;

	const userQrStyle =
		(data.qrCodeStyle as {
			image?: string;
			dotsOptions?: {
				color: string;
				type: string;
			};
			backgroundOptions?: {
				color: string;
			};
		}) || {};

	let qrCode: QRCodeStyling;
	let qrCodeLoaded = $state(false);

	const proxiedImageUrl = data.imageUrl
		? `/api/proxy-image?url=${encodeURIComponent(data.imageUrl)}`
		: undefined;

	onMount(() => {
		try {
			qrCode = new QRCodeStyling({
				width: 1000,
				height: 1000,
				data: data.user.id,
				image: proxiedImageUrl || undefined,
				imageOptions: {
					imageSize: 0.4,
				},
				dotsOptions: {
					color: userQrStyle.dotsOptions?.color || '#ffffff',
					type: (userQrStyle.dotsOptions?.type as any) || 'square',
				},
				backgroundOptions: {
					color: userQrStyle.backgroundOptions?.color || '#000000',
				},
			});
		} catch (error) {
			throw error;
		}
		qrCode.append(qrCodeContainer);

		//Force the QR code to scale after it's been appended
		setTimeout(() => {
			const qrElement = qrCodeContainer.querySelector('svg, canvas') as HTMLElement;
			if (qrElement) {
				qrElement.style.width = '100%';
				qrElement.style.height = 'auto';
				qrCodeLoaded = true;
			}
		}, 100);
	});
</script>

<svelte:head>
	<title>Rodeo | Hacker ID</title>
</svelte:head>

<div class="container">
	<!-- Left Section with Forms -->
	{#if data.user.roles.includes('HACKER')}
		<div class="left-section">
			<h3>My Details</h3>
			{#if data.group}
				<p><b>Lunch Group</b>: {data.group}</p>
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
						minlength="1"
						maxlength="50"
						required
					/>
					<button class="user-button" type="submit">Create Team</button>
				</form>
			{:else}
				<h3 class="label-and-button">
					Team: {data.team.name}
					{#if data.team.members.length < 4}
						<Modal button={false} close={closeModal}>
							<Content>
								<div class="modal">
									<form method="POST" action="?/inviteUser">
										<h3 class="modal-header">
											Invite a new member
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<img
												class="close-button"
												src="/close-button.png"
												alt="close add team member"
												draggable="false"
												onclick={() => (closeModal = true)}
												onkeypress={() => (closeModal = true)}
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
											You can only invite users who have a Rodeo account and are not already part of
											a team.
										</p>
										<button id="modalSubmit" class="user-button" type="submit"
											>Send Invitation</button
										>
									</form>
								</div>
							</Content>
							<Trigger>
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<img
									src="/add-button.png"
									alt="add team member"
									draggable="false"
									onclick={() => (closeModal = false)}
									onkeypress={() => (closeModal = false)}
								/>
							</Trigger>
						</Modal>
					{/if}
				</h3>
				{#each data.team.members as member}
					<form method="POST" action="?/removeTeammate">
						<input type="hidden" name="memberId" value={member.authUser.id} />
						<div class="member">
							<div class="member-info">
								<p>{member.authUser.email}</p>
							</div>
							{#if member.authUser.id !== data.user.id}
								<button type="submit">X</button>
							{/if}
						</div>
					</form>
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
	{#if data.user !== undefined && (!data.user.roles.includes('HACKER') || data.user.roles.length > 1 || data.user.status === 'CONFIRMED' || data.user.status === 'ACCEPTED' || data.user.status === 'DECLINED')}
		<!-- Right Section with Hacker ID -->
		<div class="right-section">
			{#if data.user.status === 'CONFIRMED'}
				<div class="right-section">
					<h3>My Hacker ID</h3>

					<div class="id-card">
						<div bind:this={qrCodeContainer} id="qrcode" class:loaded={qrCodeLoaded}></div>
						<img src="hacker-id/background.png" alt="hacker id-card" />
					</div>
				</div>
				<div class="wallet-download-buttons">
					{#if data.applePass}
						<button
							class="wallet-download-button"
							class:disabled={isButtonsDisabled}
							onclick={() => downloadPass(data.applePass, 'hacktx-2025-apple.pkpass')}
						>
							<img src="apple-wallet-download.png" alt="apple wallet download" />
						</button>
					{/if}
					{#if data.googlePass}
						<button
							class="wallet-download-button"
							class:disabled={isButtonsDisabled}
							onclick={() => downloadPass(data.googlePass, 'hacktx-2025-google.pkpass')}
						>
							<img src="google-wallet-download.png" alt="google wallet download" />
						</button>
					{/if}
				</div>
			{:else if data.user.status === 'ACCEPTED'}
				<h3>RSVP Required</h3>
				<p>Click here to RSVP for the event!</p>
				<a href="/apply" class="user-button">RSVP Now</a>
			{:else if data.user.status === 'DECLINED'}
				<h3>Invitation Declined</h3>
				<p>You have declined your invitation.</p>
			{:else}
				<p>Your application is still being processed.</p>
			{/if}
			{#if data.user.roles.includes('ADMIN')}
				<div class="id-card">
					<div bind:this={qrCodeContainer} id="qrcode" class:loaded={qrCodeLoaded}></div>
					<img src="hacker-id/background.png" alt="hacker id-card" />
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	h3 {
		margin-bottom: 0.5em;
	}

	.wallet-download-button {
		border: none;
		padding: 0 0;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.1s;
		background-color: var(--blue);
		margin-top: 1.5rem;
		margin-right: 1rem;
	}
	.wallet-download-button img {
		width: 10rem;
	}
	.wallet-download-button.disabled {
		opacity: 0.75;
		cursor: not-allowed;
	}
	.wallet-download-button.disabled img {
		filter: grayscale(100%);
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
		max-width: 350px;
	}

	.id-card #qrcode {
		position: absolute;
		object-fit: contain;
		margin: 18%;
		margin-top: 30%;
		border-radius: 10%;
		opacity: 0;
		transition: opacity 0.2s ease-in-out;
	}

	.id-card #qrcode.loaded {
		opacity: 1;
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
