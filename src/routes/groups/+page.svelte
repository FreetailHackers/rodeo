<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Rodeo | Scan</title>
</svelte:head>

<div class="main-content">
	<h1>Scan</h1>
	<hr />
	<section>
		{#if data.groups.length === 0}
			<i>No groups configured. Add groups at <a href="/admin">admin panel</a>.</i>
		{/if}
		<div class="groups-container">
			{#each data.groups as group}
				<div class="group-box">
					<h3>Group {group.group}</h3>
					<p>Member Count: {group.memberCount}</p>
					<div class="members-list">
						{#each group.members as member}
							<div class="member-row">
								<span>Team ID: {member.id}</span>
								<span>Email: {member.email}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	hr {
		margin-bottom: 2rem;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.groups-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
	}

	.group-box {
		width: 50vh;
		border: 1px solid #ccc;
		border-radius: 5px;
		padding: 10px;
	}

	.members-list {
		height: 200px;
		overflow-y: auto;
	}

	.member-row {
		display: flex;
		justify-content: space-between;
		padding: 5px 0;
		border-bottom: 1px solid #eee;
	}
</style>
