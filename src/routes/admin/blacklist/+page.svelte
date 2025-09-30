<script lang="ts">
	import { enhance } from '$app/forms';
	import BlacklistPanel from './blacklist-panel.svelte';

	let { data = $bindable() } = $props();

	// the panel edits these via bind:
	let emails = $state<string[]>([...(data.emails ?? [])]);
	let names = $state<string[]>([...(data.names ?? [])]);
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

		<BlacklistPanel bind:emails bind:names />

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

	.actions {
		margin: 0.5rem 0 1rem;
	}

	.save-btn {
		padding: 0.4rem 0.9rem;
		font-size: 0.9rem;
		background: var(--accent);
		color: #0b1330; /* dark background contrast */
		border: 1px solid var(--accent);
		cursor: pointer;
	}

	.save-btn:hover {
		opacity: 0.9;
	}
</style>
