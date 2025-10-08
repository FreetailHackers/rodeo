<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	let emails = $state<string[]>(data.emails ?? []);
	let names = $state<string[]>(data.names ?? []);

	let pendingEmail = $state('');
	let pendingName = $state('');

	const normalizeName = (s: string) =>
		s
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.trim()
			.replace(/\s+/g, ' ');

	const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

	function add(kind: 'email' | 'name') {
		if (kind === 'email') {
			const value = pendingEmail.trim().toLowerCase();
			if (!value) return;
			if (!emailRe.test(value)) return; // optional UX guard
			if (!emails.includes(value)) emails = [...emails, value];
			pendingEmail = '';
		} else {
			const value = normalizeName(pendingName);
			if (!value) return;
			if (!names.includes(value)) names = [...names, value];
			pendingName = '';
		}
	}

	const removeEmail = (toRemove: string) => (emails = emails.filter((email) => email !== toRemove));
	const removeName = (toRemove: string) => (names = names.filter((name) => name !== toRemove));
</script>

<div class="main-content">
	<form
		method="POST"
		action="?/save"
		use:enhance={() =>
			({ update }) =>
				update({ reset: false })}
	>
		<input type="hidden" name="emails" value={JSON.stringify(emails)} />
		<input type="hidden" name="names" value={JSON.stringify(names)} />

		<div class="grid">
			<div>
				<b>Emails</b>
				<div class="row">
					<input
						type="email"
						placeholder="Add email"
						bind:value={pendingEmail}
						oninput={(event) =>
							(pendingEmail = (event.target as HTMLInputElement).value.toLowerCase())}
						onkeydown={(event) => event.key === 'Enter' && (event.preventDefault(), add('email'))}
						style="text-transform: lowercase;"
					/>
					<button type="button" onclick={() => add('email')}>Add</button>
				</div>
				{#if emails.length === 0}
					<p class="muted">No emails</p>
				{/if}
				{#each emails as email}
					<div class="row">
						<span class="pill">{email}</span>
						<button class="small-btn" type="button" onclick={() => removeEmail(email)}>X</button>
					</div>
				{/each}
			</div>

			<div>
				<b>Names</b>
				<div class="row">
					<input
						placeholder="Add full name"
						bind:value={pendingName}
						onkeydown={(event) => event.key === 'Enter' && (event.preventDefault(), add('name'))}
					/>
					<button type="button" onclick={() => add('name')}>Add</button>
				</div>
				{#if names.length === 0}
					<p class="muted">No names</p>
				{/if}
				{#each names as name}
					<div class="row">
						<span class="pill">{name}</span>
						<button class="small-btn" type="button" onclick={() => removeName(name)}>X</button>
					</div>
				{/each}
			</div>
		</div>

		<div class="actions">
			<button class="save-btn" type="submit">Save</button>
		</div>
	</form>
</div>

<style>
	.main-content {
		padding: 0 1.25rem;
	}
	@media (min-width: 780px) {
		.main-content {
			padding-left: 2rem;
			padding-right: 2rem;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 0.75rem;
	}
	.grid b {
		color: var(--accent);
		font-weight: 600;
	}

	.row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		margin: 0.25rem 0;
	}
	.pill {
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: var(--dark-blue);
		color: var(--white);
	}
	.muted {
		color: var(--grey);
		opacity: 0.7;
	}

	.actions {
		margin: 0.5rem 0 1rem;
	}
	.save-btn {
		padding: 0.4rem 0.9rem;
		font-size: 0.9rem;
		background: var(--accent);
		color: var(--dark-blue);
		border: 1px solid var(--accent);
		cursor: pointer;
	}
	.save-btn:hover {
		opacity: 0.9;
	}

	.small-btn {
		padding: 0.4rem 0.6rem;
		font-size: 0.75rem;
		line-height: 1;
		border: 1px solid var(--accent);
		border-radius: 4px;
		background: var(--accent);
		color: var(--dark-blue);
		cursor: pointer;
	}

	.small-btn:hover {
		opacity: 0.9;
	}
</style>
