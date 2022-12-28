<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<p>There are currently 0 people in the queue.</p>

<form method="POST" use:enhance>
	<button>Request a Mentor</button>
</form>
{#if form}
	<p>{form}</p>
{/if}
