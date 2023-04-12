<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role } from '@prisma/client';
	import Radio from '$lib/components/radio.svelte';
	import Multiselect from '$lib/components/multiselect.svelte';

	export let data;
	let recipient = '';
	const group = [''];

	const placeholder = 'Start typing test email here...';
</script>

{#if data.user?.role === Role.ADMIN}
	<form
		method="POST"
		use:enhance={() => {
			return async ({ update }) => {
				update({ reset: false });
			};
		}}
	>
		<Radio name="Recipient" choices={['choice1', 'choice2']} bind:value={recipient} required />

		<Multiselect
			value={group}
			name="Group"
			label="Which group of recipients are you sending the email? (hold CTRL/⌘ to select multiple)"
			options={[
				'CREATED',
				'VERIFIED',
				'APPLIED',
				'ACCEPTED',
				'REJECTED',
				'WAITLISTED',
				'CONFIRMED',
				'DECLINED',
			]}
		/>

		<textarea id="email" name="email" rows="10" {placeholder}>{data.info}</textarea>
		<button type="submit">Save</button>
	</form>
{/if}

<style>
	textarea {
		height: 32rem;
	}
</style>
