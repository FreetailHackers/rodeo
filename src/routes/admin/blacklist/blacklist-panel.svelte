<script lang="ts">
	// make props bindable so parent <BlacklistPanel bind:emails bind:names /> works
	let { emails = $bindable<string[]>([]), names = $bindable<string[]>([]) } = $props();

	let newEmail = $state('');
	let newName = $state('');

	function addEmail() {
		const normalizedEmail = newEmail.trim().toLowerCase();
		if (normalizedEmail && !emails.includes(normalizedEmail)) emails = [...emails, normalizedEmail];
		newEmail = '';
	}
	function addName() {
		const candidateName = newName.trim();
		if (candidateName && !names.includes(candidateName)) names = [...names, candidateName];
		newName = '';
	}
	const removeEmail = (emailToRemove: string) =>
		(emails = emails.filter((existingEmail) => existingEmail !== emailToRemove));
	const removeName = (nameToRemove: string) =>
		(names = names.filter((existingName) => existingName !== nameToRemove));
</script>

<div class="grid">
	<div>
		<b>Emails</b>
		<div class="row">
			<input
				placeholder="Add email"
				bind:value={newEmail}
				onkeydown={(evt) => evt.key === 'Enter' && (evt.preventDefault(), addEmail())}
			/>
			<button type="button" onclick={addEmail}>Add</button>
		</div>
		{#if emails.length === 0}<p class="muted">No emails</p>{/if}
		{#each emails as email}
			<div class="row">
				<span class="pill">{email}</span>
				<button type="button" onclick={() => removeEmail(email)}>remove</button>
			</div>
		{/each}
	</div>

	<div>
		<b>Names</b>
		<div class="row">
			<input
				placeholder="Add full name"
				bind:value={newName}
				onkeydown={(evt) => evt.key === 'Enter' && (evt.preventDefault(), addName())}
			/>
			<button type="button" onclick={addName}>Add</button>
		</div>
		{#if names.length === 0}<p class="muted">No names</p>{/if}
		{#each names as name}
			<div class="row">
				<span class="pill">{name}</span>
				<button type="button" onclick={() => removeName(name)}>remove</button>
			</div>
		{/each}
	</div>
</div>

<div style="margin-top:1rem"></div>

<style>
	.row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin: 0.25rem 0;
	}
	.pill {
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: #222;
	}
	.muted {
		opacity: 0.7;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	button {
		padding: 0.4rem 0.75rem;
	}
	.grid b {
		color: var(--accent);
		font-weight: 600;
	}
</style>
