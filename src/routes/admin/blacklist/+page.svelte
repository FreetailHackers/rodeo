<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/stores';
	import type { SubmitFunction } from '@sveltejs/kit';

	let { data } = $props();

	let emails = $state<string[]>(data.emails ?? []);
	let names = $state<string[]>(data.names ?? []);

	let pendingEmail = $state('');
	let pendingName = $state('');

	$effect(() => {
		emails = data.emails ?? [];
		names = data.names ?? [];
	});

	const enhanceAndRefresh: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const data: any = result.data;
				if (data?.message) toasts.notify(data.message);
				await update({ reset: true });
			} else if (result.type === 'failure') {
				const msg = (result.data as any)?.message ?? 'Request failed.';
				toasts.notify(msg);
				await update({ reset: false });
			} else {
				toasts.notify('Unexpected response.');
				await update({ reset: false });
			}
		};
	};
</script>

<div class="main-content">
	<div class="grid">
		<!-- Emails column -->
		<div>
			<b>Emails</b>

			<form method="POST" action="?/add" use:enhance={enhanceAndRefresh}>
				<input type="hidden" name="kind" value="email" />
				<input type="hidden" name="value" value={pendingEmail.trim().toLowerCase()} />
				<div class="row">
					<input
						type="email"
						placeholder="Add email"
						bind:value={pendingEmail}
						style="text-transform: lowercase;"
					/>
					<button type="submit">Add</button>
				</div>
			</form>

			{#if emails.length === 0}
				<p class="muted">No emails</p>
			{/if}

			{#each emails as email}
				<form method="POST" action="?/remove" use:enhance={enhanceAndRefresh}>
					<input type="hidden" name="kind" value="email" />
					<input type="hidden" name="value" value={email} />
					<div class="row">
						<span class="pill">{email}</span>
						<button class="small-btn" type="submit">X</button>
					</div>
				</form>
			{/each}
		</div>

		<!-- Names column -->
		<div>
			<b>Names</b>

			<form method="POST" action="?/add" use:enhance={enhanceAndRefresh}>
				<input type="hidden" name="kind" value="name" />
				<input type="hidden" name="value" value={pendingName} />
				<div class="row">
					<input placeholder="Add full name" bind:value={pendingName} />
					<button type="submit">Add</button>
				</div>
			</form>

			{#if names.length === 0}
				<p class="muted">No names</p>
			{/if}

			{#each names as name}
				<form method="POST" action="?/remove" use:enhance={enhanceAndRefresh}>
					<input type="hidden" name="kind" value="name" />
					<input type="hidden" name="value" value={name} />
					<div class="row">
						<span class="pill">{name}</span>
						<button class="small-btn" type="submit">X</button>
					</div>
				</form>
			{/each}
		</div>
	</div>
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
