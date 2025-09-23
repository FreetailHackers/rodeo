<script lang="ts">
	import { onMount } from 'svelte';
	let emails: string[] = [],
		names: string[] = [];
	let newEmail = '',
		newName = '';
	let loading = false,
		saving = false,
		err = '';

	async function load() {
		loading = true;
		err = '';
		try {
			const r = await fetch('/blacklist');
			if (!r.ok) throw new Error();
			const d = await r.json();
			emails = d.emails ?? [];
			names = d.names ?? [];
		} catch {
			err = 'Failed to load blacklist';
		} finally {
			loading = false;
		}
	}

	async function save() {
		saving = true;
		err = '';
		try {
			const r = await fetch('/blacklist', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ emails, names }),
			});
			if (!r.ok) throw new Error();
		} catch {
			err = 'Failed to save';
		} finally {
			saving = false;
		}
	}

	function addEmail() {
		const v = newEmail.trim().toLowerCase();
		if (v && !emails.includes(v)) emails = [...emails, v];
		newEmail = '';
	}
	function addName() {
		const v = newName.trim();
		if (v && !names.includes(v)) names = [...names, v];
		newName = '';
	}
	const removeEmail = (v: string) => (emails = emails.filter((x) => x !== v));
	const removeName = (v: string) => (names = names.filter((x) => x !== v));

	onMount(load);
</script>

{#if loading}<p class="muted">Loading…</p>{/if}
{#if err}<p style="color:#e66">{err}</p>{/if}

<div class="grid">
	<div>
		<b>Emails</b>
		<div class="row">
			<input
				placeholder="add email"
				bind:value={newEmail}
				on:keydown={(e) => e.key === 'Enter' && addEmail()}
			/>
			<button on:click={addEmail}>Add</button>
		</div>
		{#if emails.length === 0}<p class="muted">No emails</p>{/if}
		{#each emails as e}
			<div class="row">
				<span class="pill">{e}</span><button on:click={() => removeEmail(e)}>remove</button>
			</div>
		{/each}
	</div>

	<div>
		<b>Names</b>
		<div class="row">
			<input
				placeholder="add full name"
				bind:value={newName}
				on:keydown={(e) => e.key === 'Enter' && addName()}
			/>
			<button on:click={addName}>Add</button>
		</div>
		{#if names.length === 0}<p class="muted">No names</p>{/if}
		{#each names as n}
			<div class="row">
				<span class="pill">{n}</span><button on:click={() => removeName(n)}>remove</button>
			</div>
		{/each}
	</div>
</div>

<div style="margin-top:1rem">
	<button on:click={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
</div>

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
</style>
