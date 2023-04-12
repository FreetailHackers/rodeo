<script lang="ts">
	import { enhance } from '$app/forms';
	import { Role } from '@prisma/client';
	import Multiselect from '$lib/components/multiselect.svelte';

	export let data;
	const group = [''];
</script>

{#if data.user?.role === Role.ADMIN}
	<form method="POST" action="?/email" use:enhance>
		<Multiselect
			value={group}
			name="Group"
			label="Which group of recipients are you sending the email to? (hold CTRL/⌘ to select multiple)"
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

		<input type="text" name="subject" placeholder="Enter the subject for this email" required />
		<textarea id="email" name="email" placeholder="Start typing test email here..." />
		<button type="submit">Send Email</button>
	</form>
{/if}

<style>
	textarea {
		height: 20rem;
	}
</style>
