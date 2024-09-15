<script lang="ts">
	import { enhance } from '$app/forms';

	export let data;

	let accept = true;

	function setAction(value: boolean) {
		accept = value;
	}
</script>

<div class="main-content">
	<form method="POST" action="?/respondInvitation" use:enhance>
		<h1>Team Invitation</h1>

		<p>Would you like to accept or decline the invitation?</p>

		<input type="hidden" name="action" value={accept ? 'accept' : 'decline'} />
		<input type="hidden" name="token" value={data.token} />
		<input type="hidden" name="teamId" value={data.teamId} />

		<div>
			<button type="submit" on:click={() => setAction(true)}>Accept</button>
			<button class="negative-button" type="submit" on:click={() => setAction(false)}
				>Decline</button
			>
		</div>

		<p>
			<b>Note:</b> You cannot accept the invite if you're already on a team, the team has 4 members,
			or the link has expired. Teams are in beta, and any issues won't affect your Devpost submission.
		</p>
	</form>
</div>
